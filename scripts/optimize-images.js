// scripts/optimize-images.js
// Comprime las imágenes pesadas del /public/images con sharp.
// Idempotente: si ya están comprimidas (peso < umbral), no hace nada.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Targets: imágenes que pesan > 200 KB y se cargan en home/producto.
const targets = [
  { file: 'prueba.webp', format: 'webp', quality: 78, maxWidth: 1600 },
  { file: 'prueba2.webp', format: 'webp', quality: 78, maxWidth: 1600 },
  { file: 'prueba3.webp', format: 'webp', quality: 78, maxWidth: 1600 },
  { file: 'banner2.png', format: 'webp', quality: 80, maxWidth: 1920, replaceWith: 'banner2.webp' },
  { file: 'mario.png', format: 'webp', quality: 80, maxWidth: 600, replaceWith: 'mario.webp' },
  { file: 'portada.webp', format: 'webp', quality: 80, maxWidth: 1920 },
  { file: 'aaa.png', format: 'webp', quality: 80, maxWidth: 800, replaceWith: 'aaa.webp' },
  { file: 'emuladores2.webp', format: 'webp', quality: 80, maxWidth: 1200 },
];

(async () => {
  for (const t of targets) {
    const src = path.join(IMAGES_DIR, t.file);
    if (!fs.existsSync(src)) {
      console.log(`SKIP (not found): ${t.file}`);
      continue;
    }
    const sizeBefore = fs.statSync(src).size;
    if (sizeBefore < 200 * 1024 && !t.replaceWith) {
      console.log(`SKIP (already small ${(sizeBefore/1024).toFixed(0)} KB): ${t.file}`);
      continue;
    }

    const tmp = src + '.tmp';
    let pipeline = sharp(src).resize({ width: t.maxWidth, withoutEnlargement: true });
    if (t.format === 'webp') pipeline = pipeline.webp({ quality: t.quality, effort: 6 });
    if (t.format === 'avif') pipeline = pipeline.avif({ quality: t.quality });

    await pipeline.toFile(tmp);
    const sizeAfter = fs.statSync(tmp).size;

    const dest = t.replaceWith ? path.join(IMAGES_DIR, t.replaceWith) : src;
    fs.renameSync(tmp, dest);

    // Si reemplazamos a otro nombre, borramos el original solo si era PNG (la web actualizará referencias)
    if (t.replaceWith && t.file !== t.replaceWith) {
      fs.unlinkSync(src);
    }

    console.log(
      `OK ${t.file} -> ${t.replaceWith || t.file}: ${(sizeBefore/1024).toFixed(0)} KB -> ${(sizeAfter/1024).toFixed(0)} KB ` +
      `(-${(100 - (sizeAfter*100/sizeBefore)).toFixed(0)}%)`
    );
  }
})();
