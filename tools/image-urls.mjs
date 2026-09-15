/**
 * Netlify Image CDN helper.
 *
 * Real photography belongs in site/images/ as JPG or PNG. Netlify's Image CDN
 * then converts and resizes it on the fly (WebP/AVIF, 320w to 1920w) with no
 * build step, so you can replace the placeholders without touching a pipeline.
 *
 * For each photo in site/images, this script prints the exact <picture> markup
 * to paste into the page. Run it after adding photos:
 *
 *     node tools/image-urls.mjs hero.jpg dining-room.jpg
 *
 * Then paste the output where the placeholder <img> currently sits.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES_DIR = join(ROOT, 'site', 'images');

const WIDTHS = [320, 640, 1024, 1920];
const SITE = 'https://bocabicester.com';

const files = process.argv.slice(2);

if (!files.length) {
  console.error('Usage: node tools/image-urls.mjs <photo.jpg> [more.jpg ...]');
  console.error('Photos live in site/images/.');
  process.exit(1);
}

/** Netlify Image CDN URL: /images/... is served from the publish directory. */
function cdn(file, width, format) {
  return (
    '/.netlify/images?url=' +
    encodeURIComponent('/images/' + file) +
    '&w=' + width +
    '&fm=' + format +
    '&q=72'
  );
}

for (const file of files) {
  if (!existsSync(join(IMAGES_DIR, file))) {
    console.error(`! ${file} not found in site/images/ — skipping`);
    continue;
  }

  const base = file.replace(/\.[^.]+$/, '');
  const webp = WIDTHS.map((w) => `${cdn(file, w, 'webp')} ${w}w`).join(',\n      ');
  const avif = WIDTHS.map((w) => `${cdn(file, w, 'avif')} ${w}w`).join(',\n      ');

  console.log(`\n<!-- ${file} -->`);
  console.log(`<picture>
  <source type="image/avif" srcset="
      ${avif}"
    sizes="(min-width: 900px) 50vw, 100vw">
  <source type="image/webp" srcset="
      ${webp}"
    sizes="(min-width: 900px) 50vw, 100vw">
  <img src="/images/${file}"
    alt="REPLACE: describe ${base} for someone who cannot see it"
    width="1600" height="1200"
    loading="lazy" decoding="async">
</picture>`);
}

console.log(`
Notes
-----`);
console.log(`* Keep width/height attributes accurate (real pixel dimensions) to protect CLS.`);
console.log(`* Absolute image URLs are needed for og:image — e.g. ${SITE}/images/hero.jpg`);
console.log(`* If you host photos on a CDN (Cloudinary, imgix) swap the cdn() helper above.`);
console.log(`* Only images inside site/ are published; source masters can live outside it.`);
