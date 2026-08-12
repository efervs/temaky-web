/**
 * export-google-ads.mjs — arma el archivo de carga de conversiones offline de Google Ads a partir
 * de la bitácora D1 de ventas.
 *
 * POR QUÉ ESTO EXISTE
 * Meta rechaza todo evento de más de 7 días (src/lib/capi.ts:107-113). Google admite 90. Las
 * ventas que se registran tarde nunca llegan a Meta, pero sí pueden llegar a Google — y esas son
 * justamente las que hoy se pierden. Este script las recupera.
 *
 * USO
 *   node scripts/export-google-ads.mjs                    # últimos 90 días
 *   node scripts/export-google-ads.mjs --dias 30
 *   node scripts/export-google-ads.mjs --conversion "Compra registrada"
 *
 * Requiere `npx wrangler login` una vez. Deja el CSV en reports/ y NO lo versiona: lleva montos
 * de ventas reales.
 *
 * Después: Google Ads → Objetivos → Conversiones → Cargas → subir el CSV.
 * Esperar 4-6 h desde que se creó la acción de conversión antes de la primera carga.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const D1_UUID = 'ae0524f2-5c2d-454c-8b34-6caa202ccf34'; // temaky-ventas
const TZ = 'America/Monterrey'; // México ya no tiene horario de verano: siempre -0600

const args = process.argv.slice(2);
const opcion = (nombre, pordefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : pordefecto;
};

const dias = Number(opcion('dias', '90'));
/* Debe coincidir EXACTAMENTE con el nombre de la acción de conversión en Google Ads. */
const nombreConversion = opcion('conversion', 'Compra registrada');

if (dias > 90) {
  console.error(`La ventana de importación de Google es de 90 días. Pediste ${dias}.`);
  process.exit(1);
}

/** Consulta D1 en remoto vía wrangler y devuelve las filas. */
function consultarD1(sql) {
  const salida = execFileSync(
    'npx',
    ['--yes', 'wrangler', 'd1', 'execute', D1_UUID, '--remote', '--json', '--command', sql],
    { cwd: RAIZ, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, shell: true },
  );
  /* wrangler antepone banners al JSON; se recorta desde el primer corchete. */
  const json = salida.slice(Math.min(...['[', '{'].map((c) => {
    const i = salida.indexOf(c);
    return i === -1 ? Infinity : i;
  })));
  const parsed = JSON.parse(json);
  return (Array.isArray(parsed) ? parsed[0] : parsed)?.results ?? [];
}

/** unix → "yyyy-MM-dd HH:mm:ss" en hora de Monterrey, que es el formato que pide Google. */
function fechaGoogle(unix) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(unix * 1000));
  const g = (t) => p.find((x) => x.type === t).value;
  return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}:${g('second')}`;
}

const desde = Math.floor(Date.now() / 1000) - dias * 24 * 60 * 60;
const filas = consultarD1(
  `SELECT event_time, value, gclid FROM ventas
    WHERE gclid IS NOT NULL AND gclid != '' AND event_time >= ${desde}
    ORDER BY event_time`,
);

if (filas.length === 0) {
  console.log(`Sin ventas con click id de Google en los últimos ${dias} días. No se generó archivo.`);
  console.log('Normal si la campaña lleva poco encendida o si Mafer aún no copia el [ref: ...] del chat.');
  process.exit(0);
}

/* Google exige exactamente UNO de los tres identificadores por fila, cada uno en su columna. */
const COLUMNAS = ['Google Click ID', 'GBRAID', 'WBRAID', 'Conversion Name', 'Conversion Time', 'Conversion Value', 'Conversion Currency'];
const conteo = { gclid: 0, gbraid: 0, wbraid: 0, descartadas: 0 };

const lineas = [`Parameters:TimeZone=${TZ}`, COLUMNAS.join(',')];

for (const fila of filas) {
  const [tipo, valor] = String(fila.gclid).split(':');
  if (!['gclid', 'gbraid', 'wbraid'].includes(tipo) || !valor) {
    conteo.descartadas++;
    continue;
  }
  conteo[tipo]++;
  lineas.push([
    tipo === 'gclid' ? valor : '',
    tipo === 'gbraid' ? valor : '',
    tipo === 'wbraid' ? valor : '',
    `"${nombreConversion.replace(/"/g, '""')}"`,
    fechaGoogle(fila.event_time),
    fila.value,
    'MXN',
  ].join(','));
}

const hoy = fechaGoogle(Math.floor(Date.now() / 1000)).slice(0, 10);
const destino = join(RAIZ, 'reports', `conversiones-google-${hoy}.csv`);
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, lineas.join('\n') + '\n', 'utf8');

console.log(`Archivo: ${destino}`);
console.log(`Filas: ${lineas.length - 2} (gclid ${conteo.gclid} · gbraid ${conteo.gbraid} · wbraid ${conteo.wbraid})`);
if (conteo.descartadas) console.log(`Descartadas por click id mal formado: ${conteo.descartadas}`);
console.log(`Acción de conversión: "${nombreConversion}" — debe existir con ESE nombre exacto en Google Ads.`);
console.log('Subir en: Google Ads → Objetivos → Conversiones → Cargas.');
