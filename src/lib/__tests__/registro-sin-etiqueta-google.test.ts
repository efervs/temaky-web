/**
 * 2026-11-16: `/registro-de-compras/` no carga la etiqueta de Google.
 *
 * La etiqueta AW-18358666123 tiene encendida, desde la cuenta, la recolección automática de datos
 * del usuario (teléfono, correo y dirección) y la detección de formularios. En el registro el
 * equipo teclea teléfonos de clientes: esa página no debe cargarla. El resto del sitio sí.
 *
 * Estas pruebas leen el código fuente. La comprobación del HTML generado se hace después del
 * build (0 apariciones de la etiqueta en `dist/registro-de-compras/index.html`).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const lee = (ruta: string): string => readFileSync(join(process.cwd(), ruta), 'utf8');

const layout = lee('src/layouts/BaseLayout.astro');
const registro = lee('src/pages/registro-de-compras.astro');
const inicio = lee('src/pages/index.astro');
const aviso = lee('src/pages/aviso-de-privacidad.astro');

/** La etiqueta de apertura de <BaseLayout …> de una página. */
function aperturaLayout(pagina: string): string {
  const m = /<BaseLayout\b[^>]*>/.exec(pagina);
  expect(m, 'la página no usa <BaseLayout>').not.toBeNull();
  return m![0];
}

describe('etiqueta de Google: fuera de /registro-de-compras/', () => {
  it('el layout acepta `sinEtiquetaGoogle`, apagada por defecto', () => {
    expect(layout).toMatch(/sinEtiquetaGoogle\?: boolean;/);
    expect(layout).toMatch(/sinEtiquetaGoogle = false,/);
  });

  it('el layout sólo pinta la etiqueta si `sinEtiquetaGoogle` está apagada', () => {
    const inicioBloque = layout.indexOf('{!sinEtiquetaGoogle && (');
    const carga = layout.indexOf('https://www.googletagmanager.com/gtag/js?id=AW-18358666123');
    const config = layout.indexOf("gtag('config', 'AW-18358666123');");
    const conv = layout.indexOf('window.temakyConv = function');
    const finBloque = layout.search(/<\/Fragment>\r?\n\s*\)\}/);

    expect(inicioBloque, 'falta la condición').toBeGreaterThan(-1);
    expect(finBloque, 'falta el cierre de la condición').toBeGreaterThan(-1);
    for (const pos of [carga, config, conv]) {
      expect(pos).toBeGreaterThan(inicioBloque);
      expect(pos).toBeLessThan(finBloque);
    }
    // Una sola carga de la etiqueta en todo el layout: nada queda fuera de la condición.
    expect(layout.split('googletagmanager.com').length - 1).toBe(1);
    expect(layout.split("gtag('config'").length - 1).toBe(1);
  });

  it('el registro de compras la apaga', () => {
    expect(aperturaLayout(registro)).toMatch(/\bsinEtiquetaGoogle=\{true\}/);
  });

  it('el inicio y el aviso de privacidad la conservan', () => {
    expect(aperturaLayout(inicio)).not.toContain('sinEtiquetaGoogle');
    expect(aperturaLayout(aviso)).not.toContain('sinEtiquetaGoogle');
  });

  it('el rastreo de WhatsApp tolera que la etiqueta no exista', () => {
    expect(lee('src/lib/wa-tracking.ts')).toContain('window.temakyConv?.();');
  });
});
