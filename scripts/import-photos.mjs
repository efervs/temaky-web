// scripts/import-photos.mjs
// Importa las fotos de la sesión NextSwift (Google Drive) al sitio.
//
// Para cada platillo: usa la carpeta "exterior" (si está vacía, "interior"),
// ordena con la foto "hero" (nombre del platillo) primero y luego los IMG_####,
// las convierte a .webp optimizado y las escribe en
//   public/images/products/g/<productId>/NN.webp
// Finalmente genera src/data/product-galleries.ts con el mapa id -> [rutas web].
//
// Reglas especiales:
//  - Carpeta "Combo clásico": reparte cada foto por prefijo de nombre
//      "Cuarzo ..." -> combo-signature ; el resto -> combo-clasico
//  - Carpetas de pares (Promo 2 rollos): toma SOLO la foto hero de cada par
//    y las agrupa en promo-clasico / promo-signature.
//
// Uso:  node scripts/import-photos.mjs
//       node scripts/import-photos.mjs --dry   (no escribe, solo reporta)

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DRY = process.argv.includes('--dry');

const SRC =
  'G:\\Mi unidad\\NextSwift\\Operación NextSwift\\Temaky Sushi\\Fotos y videos Stock Temaky Sushi\\Nuevas fotos sesión fotográfica NextSwift\\Fotografías TOP raw';

const PROJECT = process.cwd();
const OUT_ROOT = path.join(PROJECT, 'public', 'images', 'products', 'g');
const WEB_ROOT = '/images/products/g';
const GEN_TS = path.join(PROJECT, 'src', 'data', 'product-galleries.ts');

const MAX_DIM = 1400; // px (lado mayor)
const QUALITY = 80;

// ── Mapeo carpeta individual -> product id ────────────────────────────────
const DISHES = {
  'Arjona': 'arjona',
  'Arroz camarón (media porción)': 'a-camaron',
  'Arroz carne (media porción)': 'a-carne',
  'Arroz especial (media porción)': 'a-especial',
  'Arroz Mixto (porción entera)': 'a-mixto', // se prefiere la porción entera
  'Arroz Pollo (porcion entera)': 'a-pollo',
  'Arroz Temaky (media porción)': 'a-temaky',
  'Arroz vegetariano (media porción)': 'a-vegetariano',
  'Arroz Verdura (porcion entera)': 'a-verduras', // se prefiere la porción entera
  'Barry': 'barry',
  'Brochetas de queso (media orden)': 'kushiages',
  'Brownie con nieve': 'brownie',
  'Cangrejo nevado': 'cangrejo-nev',
  'Chili': 'chili',
  'Colorado': 'colorado',
  'Combo Boneless Buffalo': 'boneless',
  'Cordero': 'cordero',
  'Cuarzo': 'cuarzo',
  'Dinamita Roll': 'dinamita',
  'Dumplings': 'dumplings',
  'Edamames': 'edamames',
  'Ensalada de Cangrejo (porción entera)': 'suno-cangrejo', // se prefiere la entera
  'Garfield': 'garfield',
  'Gyosas': 'gyosas',
  'Helado tempura': 'helado-t',
  'Kiko': 'kiko',
  'Leyes': 'leyes',
  'Mango Roll': 'mango-roll',
  'Medicina': 'medicina',
  'Onix': 'onix',
  'Regional': 'regional',
  'Rollo Obispado': 'obispado',
  'Sayonara': 'sayonara',
  'Teppanyaki Pollo': 'teppan-pollo',
  'Tribilin': 'tribilin',
  'Tuna Spicy': 'tuna-spicy',
  'Villareal': 'villarreal',
  'Yasal Tempura': 'yasai',
};

// Carpetas que se ignoran a propósito (duplicados de porción / variantes de combo)
const IGNORE = new Set([
  'Arroz Mixto (media porción)',
  'Arroz verdura (media porción)',
  'Ensalada de Cangrejo (media porción)',
  'Cangrejo nevado (medio para combo)',
  '.claude',
]);

// Carpeta combo: routing por prefijo de archivo
const COMBO_FOLDER = 'Combo clásico';
const comboRoute = (filename) =>
  /^cuarzo/i.test(filename.trim()) ? 'combo-signature' : 'combo-clasico';

// Promo 2 rollos: 1 foto hero por par
const PROMO = {
  'promo-clasico': [
    'Leyes- Regional',
    'Villareal- Garfield',
    'Obispado-Tribilin',
    'Medicina- Cordero',
    'Chili-Onix', // no aparece en el cuadro; se agrupa con clásicos por defecto
  ],
  'promo-signature': [
    'Dinamita - Cuarzo',
    'Mango Roll- Arjona',
    'Tuna spicy - Barry',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────
const norm = (s) => s.normalize('NFC');
const isPhoto = (f) => /\.(jpe?g|png)$/i.test(f);
const isImgName = (f) => /^IMG[_-]?\d+/i.test(f);

function buildFolderIndex() {
  const map = new Map();
  for (const d of fs.readdirSync(SRC, { withFileTypes: true })) {
    if (d.isDirectory()) map.set(norm(d.name), d.name);
  }
  return map;
}

function listPhotos(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(isPhoto);
}

// Devuelve { dir, files[] } usando exterior, o interior si exterior está vacía.
function chooseSet(folderAbs) {
  const ext = path.join(folderAbs, 'exterior');
  const intr = path.join(folderAbs, 'interior');
  let dir = ext;
  let files = listPhotos(ext);
  let used = 'exterior';
  if (files.length === 0) {
    dir = intr;
    files = listPhotos(intr);
    used = 'interior';
  }
  return { dir, files, used };
}

// hero (nombre del platillo) primero, luego IMG_#### ascendente.
function sortHeroFirst(files) {
  const heroes = files.filter((f) => !isImgName(f)).sort((a, b) => a.localeCompare(b));
  const imgs = files
    .filter(isImgName)
    .sort((a, b) => (Number(a.match(/(\d+)/)?.[1] ?? 0)) - (Number(b.match(/(\d+)/)?.[1] ?? 0)));
  return [...heroes, ...imgs];
}

async function convert(srcAbs, outAbs) {
  if (DRY) return;
  await sharp(srcAbs)
    .rotate() // auto-orienta según EXIF
    .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 4 })
    .toFile(outAbs);
}

// ── Construye la lista de trabajos { id -> [srcAbs...] } ───────────────────
const folderIndex = buildFolderIndex();
const seenFolders = new Set();
const jobs = new Map(); // id -> [srcAbs]
const warnings = [];

function pushSources(id, srcAbsList) {
  if (!jobs.has(id)) jobs.set(id, []);
  jobs.get(id).push(...srcAbsList);
}

function resolveFolder(name) {
  const actual = folderIndex.get(norm(name));
  if (!actual) {
    warnings.push(`⚠  Carpeta no encontrada: "${name}"`);
    return null;
  }
  seenFolders.add(actual);
  return path.join(SRC, actual);
}

// 1) Platillos individuales
for (const [folder, id] of Object.entries(DISHES)) {
  const abs = resolveFolder(folder);
  if (!abs) continue;
  const { dir, files, used } = chooseSet(abs);
  if (files.length === 0) {
    warnings.push(`⚠  Sin fotos en "${folder}"`);
    continue;
  }
  const ordered = sortHeroFirst(files).map((f) => path.join(dir, f));
  pushSources(id, ordered);
  if (used === 'interior') warnings.push(`ℹ  "${folder}" usa INTERIOR (exterior vacía)`);
}

// 2) Combo clásico -> reparte por prefijo
{
  const abs = resolveFolder(COMBO_FOLDER);
  if (abs) {
    const { dir, files } = chooseSet(abs);
    for (const f of sortHeroFirst(files)) {
      pushSources(comboRoute(f), [path.join(dir, f)]);
    }
  }
}

// 3) Promo 2 rollos -> 1 hero por par
for (const [id, folders] of Object.entries(PROMO)) {
  for (const folder of folders) {
    const abs = resolveFolder(folder);
    if (!abs) continue;
    const { dir, files } = chooseSet(abs);
    if (files.length === 0) {
      warnings.push(`⚠  Sin fotos en par "${folder}"`);
      continue;
    }
    const hero = sortHeroFirst(files)[0];
    pushSources(id, [path.join(dir, hero)]);
  }
}

// ── Ejecuta conversión y arma el manifiesto ───────────────────────────────
const manifest = {}; // id -> [webPaths]
let totalImgs = 0;

for (const [id, sources] of [...jobs.entries()].sort()) {
  const outDir = path.join(OUT_ROOT, id);
  if (!DRY) {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
  }
  const webPaths = [];
  let i = 0;
  for (const src of sources) {
    i += 1;
    const nn = String(i).padStart(2, '0');
    const outAbs = path.join(outDir, `${nn}.webp`);
    // eslint-disable-next-line no-await-in-loop
    await convert(src, outAbs);
    webPaths.push(`${WEB_ROOT}/${id}/${nn}.webp`);
    totalImgs += 1;
  }
  manifest[id] = webPaths;
  console.log(`  ${id.padEnd(18)} ${webPaths.length} foto(s)`);
}

// ── Genera el archivo TS ──────────────────────────────────────────────────
const orderedIds = Object.keys(manifest).sort();
const body = orderedIds
  .map((id) => {
    const arr = manifest[id].map((p) => `'${p}'`).join(', ');
    return `  ${JSON.stringify(id)}: [${arr}],`;
  })
  .join('\n');

const ts = `// AUTO-GENERADO por scripts/import-photos.mjs — no editar a mano.
// Galería de fotos por producto (orden: foto principal primero).
export const productGalleries: Record<string, string[]> = {
${body}
};
`;

if (!DRY) fs.writeFileSync(GEN_TS, ts, 'utf8');

// ── Reporte ────────────────────────────────────────────────────────────────
console.log('\n──────────────────────────────────────────────');
console.log(`Productos con galería: ${orderedIds.length}`);
console.log(`Fotos generadas:       ${totalImgs}`);
console.log(`Salida:                ${path.relative(PROJECT, OUT_ROOT)}`);
console.log(`Manifiesto TS:         ${path.relative(PROJECT, GEN_TS)}`);

// Carpetas del Drive que no se mapearon a nada (excluyendo ignoradas)
const unmapped = [...folderIndex.values()].filter(
  (f) => !seenFolders.has(f) && !IGNORE.has(f) && !IGNORE.has(norm(f)),
);
if (unmapped.length) {
  console.log('\nCarpetas del Drive NO usadas (revisar si es intencional):');
  for (const f of unmapped) console.log(`   · ${f}`);
}
if (warnings.length) {
  console.log('\nAvisos:');
  for (const w of warnings) console.log(`   ${w}`);
}
if (DRY) console.log('\n(DRY RUN — no se escribió ningún archivo)');
