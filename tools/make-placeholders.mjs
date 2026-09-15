/**
 * Generates the branded placeholder artwork that ships with the site.
 *
 *   node tools/make-placeholders.mjs
 *
 * Produces:
 *   site/images/PLACEHOLDER_hero.svg         1920x1080
 *   site/images/PLACEHOLDER_gallery-*.svg    1200x900
 *   site/images/og-image.png                 1200x630  (real PNG, no dependencies)
 *   site/favicon.svg
 *
 * These are NOT stock photos. They are warm, on-brand tiles that read as
 * "photo coming soon". Replace them with real photography (see README.md) —
 * the file names are the contract the HTML points at.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = join(ROOT, 'site', 'images');

mkdirSync(IMAGES, { recursive: true });

const COPPER = '#B87333';
const COPPER_DEEP = '#8A4E12';
const AMBER = '#C17A3A';

/** Generic 4:3 placeholder tile (light, warm, with a camera glyph). */
function tile({ id, w = 1200, h = 900 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F4ECE1"/>
      <stop offset="1" stop-color="#E2D0B8"/>
    </linearGradient>
    <radialGradient id="glow${id}" cx="0.72" cy="0.16" r="0.85">
      <stop offset="0" stop-color="${AMBER}" stop-opacity="0.34"/>
      <stop offset="1" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg${id})"/>
  <rect width="${w}" height="${h}" fill="url(#glow${id})"/>
  <g fill="none" stroke="${COPPER}" stroke-opacity="0.26" stroke-width="3">
    <circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.36}"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.28}"/>
  </g>
  <g transform="translate(${w / 2 - 66} ${h / 2 - 52})" fill="none" stroke="${COPPER_DEEP}" stroke-opacity="0.55" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="0" y="0" width="132" height="100" rx="16"/>
    <circle cx="42" cy="34" r="11"/>
    <path d="M16 82 L52 52 L82 74 L100 62 L122 84"/>
  </g>
</svg>
`;
}

/** Full-bleed hero backdrop: warm charcoal with copper embers. */
function hero({ w = 1920, h = 1080 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="heroBase" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#33302C"/>
      <stop offset="0.55" stop-color="#2C2C2C"/>
      <stop offset="1" stop-color="#1F1D1B"/>
    </linearGradient>
    <radialGradient id="emberA" cx="0.24" cy="0.22" r="0.6">
      <stop offset="0" stop-color="${AMBER}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="emberB" cx="0.85" cy="0.78" r="0.55">
      <stop offset="0" stop-color="${COPPER}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${COPPER}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#heroBase)"/>
  <rect width="${w}" height="${h}" fill="url(#emberA)"/>
  <rect width="${w}" height="${h}" fill="url(#emberB)"/>
  <g fill="none" stroke="${COPPER}" stroke-opacity="0.14" stroke-width="2">
    <path d="M0 ${h * 0.78} C ${w * 0.25} ${h * 0.7}, ${w * 0.45} ${h * 0.88}, ${w} ${h * 0.74}"/>
    <path d="M0 ${h * 0.86} C ${w * 0.3} ${h * 0.8}, ${w * 0.55} ${h * 0.95}, ${w} ${h * 0.84}"/>
  </g>
  <rect y="${h * 0.55}" width="${w}" height="${h * 0.45}" fill="url(#floor)"/>
</svg>
`;
}

const TILES = [
  'dining-room',
  'tapas',
  'paella',
  'steak',
  'desserts',
  'exterior'
];

const written = [];

for (const name of TILES) {
  const file = join(IMAGES, `PLACEHOLDER_${name}.svg`);
  writeFileSync(file, tile({ id: name.replace(/-/g, '') }), 'utf8');
  written.push(file);
}

writeFileSync(join(IMAGES, 'PLACEHOLDER_hero.svg'), hero(), 'utf8');
written.push(join(IMAGES, 'PLACEHOLDER_hero.svg'));

/* ------------------------------------------------------------------ *
 * Open Graph image — a real 1200x630 PNG so social previews work.
 * Written by hand with Node's zlib so the repo needs zero dependencies.
 * ------------------------------------------------------------------ */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function makeOgPng(width = 1200, height = 630) {
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (1 + width * 3);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      const t = (x / width) * 0.45 + (y / height) * 0.55;
      let r = lerp(44, 31, t);
      let g = lerp(44, 29, t);
      let b = lerp(44, 27, t);
      const dx = x / width - 0.78;
      const dy = y / height - 0.2;
      const glow = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 2.1);
      r = Math.min(255, r + glow * 120);
      g = Math.min(255, g + glow * 78);
      b = Math.min(255, b + glow * 28);
      if (y > height - 10) {
        r = 184;
        g = 115;
        b = 51;
      }
      const o = rowStart + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

const ogPath = join(IMAGES, 'og-image.png');
writeFileSync(ogPath, makeOgPng());
written.push(ogPath);

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#2C2C2C"/>
  <path d="M32 12c7 7 11 12 11 18a11 11 0 0 1-22 0c0-6 4-11 11-18Z" fill="${COPPER}" opacity="0.92"/>
  <path d="M18 46h28" stroke="#FAF7F2" stroke-width="4" stroke-linecap="round"/>
</svg>
`;
writeFileSync(join(ROOT, 'site', 'favicon.svg'), favicon, 'utf8');
written.push(join(ROOT, 'site', 'favicon.svg'));

console.log('Wrote:');
for (const file of written) console.log('  ' + file.replace(ROOT + '\\', ''));
