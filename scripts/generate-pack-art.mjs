// Generates placeholder pack illustrations in public/tranzlife/packs.
// Replace these SVGs with real packaging renders (transparent PNG/WebP) when available,
// and point each product's "image" field in src/data/tranzlife.json at the new file.
// Run: node scripts/generate-pack-art.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'tranzlife', 'packs');
mkdirSync(out, { recursive: true });

const GOLD = '#C49A3C';
const FONT = "font-family=\"Helvetica Neue, Arial, sans-serif\"";

const mark = (x, y, s = 1, color = '#fff') => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke-linecap="round" stroke-width="3.2">
    <path d="M0 0 C-5 -7 -9.5 -8 -13 -8 A8 8 0 0 0 -13 8 C-9.5 8 -5 7 0 0" stroke="${color}"/>
    <path d="M0 0 C5 7 9.5 8 13 8 A8 8 0 0 0 13 -8 C9.5 -8 5 -7 0 0" stroke="${GOLD}"/>
    <path d="M0 0 V-22" stroke="${color}" stroke-width="2.4"/>
    <circle cx="0" cy="-26" r="6" fill="${color}" stroke="none"/>
  </g>`;

const cylinder = (id, color) => `
  <linearGradient id="${id}" x1="0" x2="1">
    <stop offset="0" stop-color="${color}" stop-opacity="1"/>
    <stop offset="0.18" stop-color="#fff" stop-opacity="0.35"/>
    <stop offset="0.32" stop-color="${color}" stop-opacity="0"/>
    <stop offset="0.8" stop-color="#000" stop-opacity="0.12"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.3"/>
  </linearGradient>`;

const shadow = (cx, cy, rx) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.12}" fill="#163323" opacity="0.18" filter="url(#blur)"/>`;

const svg = (body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="1200" height="1200">
<defs>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  ${defs}
</defs>
${body}
</svg>`;

function gummyJar({ name, sub, color, light }) {
  return svg(
    `
  ${shadow(300, 518, 150)}
  <rect x="170" y="150" width="260" height="370" rx="38" fill="${color}"/>
  <rect x="170" y="150" width="260" height="370" rx="38" fill="url(#shade)"/>
  <rect x="190" y="104" width="220" height="64" rx="14" fill="#F4F1E6"/>
  <rect x="190" y="104" width="220" height="64" rx="14" fill="url(#shade)"/>
  ${Array.from({ length: 22 }, (_, i) => `<rect x="${196 + i * 10}" y="110" width="3" height="52" rx="1.5" fill="#000" opacity="0.06"/>`).join('')}
  <rect x="186" y="232" width="228" height="214" rx="18" fill="#F7F5EC"/>
  ${mark(300, 300, 1.25, color)}
  <text x="300" y="358" text-anchor="middle" ${FONT} font-size="34" font-weight="700" fill="${color}" letter-spacing="-1">${name}</text>
  <text x="300" y="384" text-anchor="middle" ${FONT} font-size="15" fill="#163323" letter-spacing="2">${sub}</text>
  <rect x="236" y="402" width="128" height="26" rx="13" fill="${color}"/>
  <text x="300" y="420" text-anchor="middle" ${FONT} font-size="12.5" font-weight="700" fill="#fff" letter-spacing="1.5">60 GUMMIES</text>
  <circle cx="226" cy="482" r="16" fill="${light}"/><circle cx="262" cy="490" r="16" fill="#C2457A"/><circle cx="300" cy="482" r="16" fill="${light}"/><circle cx="338" cy="490" r="16" fill="#C2457A"/><circle cx="374" cy="482" r="16" fill="${light}"/>
  `,
    cylinder('shade', color)
  );
}

function syrupBottle({ name, sub, color }) {
  return svg(
    `
  ${shadow(300, 532, 120)}
  <path d="M262 92 h76 v60 c0 18 70 38 70 96 v262 a26 26 0 0 1 -26 26 h-164 a26 26 0 0 1 -26 -26 v-262 c0 -58 70 -78 70 -96 Z" fill="#6B3A12"/>
  <path d="M262 92 h76 v60 c0 18 70 38 70 96 v262 a26 26 0 0 1 -26 26 h-164 a26 26 0 0 1 -26 -26 v-262 c0 -58 70 -78 70 -96 Z" fill="url(#shade)"/>
  <rect x="252" y="56" width="96" height="60" rx="10" fill="${GOLD}"/>
  <rect x="252" y="56" width="96" height="60" rx="10" fill="url(#shadeGold)"/>
  <rect x="204" y="272" width="192" height="226" rx="12" fill="#F7F5EC"/>
  <rect x="204" y="272" width="192" height="44" rx="12" fill="${color}"/>
  <rect x="204" y="300" width="192" height="16" fill="${color}"/>
  <text x="300" y="300" text-anchor="middle" ${FONT} font-size="13" font-weight="700" fill="#fff" letter-spacing="3">AYURVEDIC</text>
  ${mark(300, 372, 1.05, color)}
  <text x="300" y="424" text-anchor="middle" ${FONT} font-size="31" font-weight="700" fill="${color}" letter-spacing="-1">${name}</text>
  <text x="300" y="448" text-anchor="middle" ${FONT} font-size="13" fill="#163323" letter-spacing="2">${sub}</text>
  <text x="300" y="478" text-anchor="middle" ${FONT} font-size="15" font-weight="700" fill="${GOLD}">500 ml</text>
  `,
    cylinder('shade', '#6B3A12') + cylinder('shadeGold', GOLD)
  );
}

function inhaler({ name, sub, color, label = '#fff', box = true }) {
  const boxEl = box
    ? `
  <g transform="translate(110 120)">
    <path d="M0 30 L40 0 H230 L190 30 Z" fill="${color}" opacity="0.75"/>
    <rect x="0" y="30" width="190" height="370" rx="6" fill="${color}"/>
    <path d="M190 30 L230 0 V370 L190 400 Z" fill="#000" opacity="0.22"/>
    <path d="M190 30 L230 0 V370 L190 400 Z" fill="${color}" opacity="0.6"/>
    <rect x="0" y="30" width="190" height="370" rx="6" fill="url(#boxShade)"/>
    ${mark(95, 128, 1.3, label)}
    <text x="95" y="196" text-anchor="middle" ${FONT} font-size="${name.length > 15 ? 19 : 24}" font-weight="700" fill="${label}" letter-spacing="-0.5">${name.split('|')[0]}</text>
    ${name.includes('|') ? `<text x="95" y="222" text-anchor="middle" ${FONT} font-size="17" font-weight="700" fill="${GOLD}" letter-spacing="2">${name.split('|')[1]}</text>` : ''}
    <text x="95" y="252" text-anchor="middle" ${FONT} font-size="11" fill="${label}" opacity="0.85" letter-spacing="2">${sub}</text>
    <rect x="30" y="330" width="130" height="2" fill="${GOLD}"/>
    <text x="95" y="360" text-anchor="middle" ${FONT} font-size="10" fill="${label}" opacity="0.8" letter-spacing="2">TRANZLIFE BIOSCIENCES</text>
  </g>`
    : '';
  const ix = box ? 380 : 300;
  return svg(
    `
  ${shadow(box ? 300 : 300, 530, box ? 200 : 90)}
  ${boxEl}
  <g transform="translate(${ix} 0)">
    <rect x="-44" y="250" width="88" height="270" rx="44" fill="${color}"/>
    <rect x="-44" y="250" width="88" height="270" rx="44" fill="url(#shade)"/>
    <rect x="-44" y="312" width="88" height="6" fill="${GOLD}"/>
    <rect x="-22" y="196" width="44" height="66" rx="20" fill="#F4F1E6"/>
    <rect x="-22" y="196" width="44" height="66" rx="20" fill="url(#shadeLight)"/>
    <g transform="translate(0 420) rotate(-90)">
      <text text-anchor="middle" ${FONT} font-size="17" font-weight="700" fill="${label}" letter-spacing="1">${name.replace('|', ' ')}</text>
    </g>
  </g>
  `,
    cylinder('shade', color) +
      cylinder('shadeLight', '#F4F1E6') +
      `<linearGradient id="boxShade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/></linearGradient>`
  );
}

function rollOn({ name, sub, color, band = color, volume = '8 ml', tall = false }) {
  const top = tall ? 70 : 96;
  const shoulder = tall ? 200 : 230;
  return svg(
    `
  ${shadow(300, 522, 110)}
  <path d="M232 ${shoulder} h136 l24 40 v${502 - shoulder - 40} a22 22 0 0 1 -22 22 h-140 a22 22 0 0 1 -22 -22 v-${502 - shoulder - 40} Z" fill="${color}"/>
  <path d="M232 ${shoulder} h136 l24 40 v${502 - shoulder - 40} a22 22 0 0 1 -22 22 h-140 a22 22 0 0 1 -22 -22 v-${502 - shoulder - 40} Z" fill="url(#shade)"/>
  <rect x="238" y="${top}" width="124" height="${shoulder - top + 8}" rx="20" fill="#F4F1E6"/>
  <rect x="238" y="${top}" width="124" height="${shoulder - top + 8}" rx="20" fill="url(#shadeLight)"/>
  <rect x="238" y="${shoulder - 16}" width="124" height="10" fill="${GOLD}"/>
  <rect x="226" y="${shoulder + 60}" width="148" height="190" rx="10" fill="#F7F5EC"/>
  <rect x="226" y="${shoulder + 214}" width="148" height="36" rx="0" fill="${band}"/>
  ${mark(300, shoulder + 110, 1, color)}
  <text x="300" y="${shoulder + 162}" text-anchor="middle" ${FONT} font-size="${name.length > 8 ? 25 : 32}" font-weight="700" fill="${color}" letter-spacing="-1">${name}</text>
  <text x="300" y="${shoulder + 184}" text-anchor="middle" ${FONT} font-size="10.5" fill="#163323" letter-spacing="1.5">${sub}</text>
  <text x="300" y="${shoulder + 238}" text-anchor="middle" ${FONT} font-size="15" font-weight="700" fill="#fff">${volume}</text>
  `,
    cylinder('shade', color) + cylinder('shadeLight', '#F4F1E6')
  );
}

/** PulmoClear Lung Booster carton: white front, green band, lungs motif. */
function carton({ name, sub, color }) {
  return svg(
    `
  ${shadow(300, 528, 170)}
  <path d="M160 100 L196 72 H462 L426 100 Z" fill="#E9EDE0"/>
  <path d="M426 100 L462 72 V488 L426 516 Z" fill="${color}"/>
  <path d="M426 100 L462 72 V488 L426 516 Z" fill="#000" opacity="0.18"/>
  <rect x="160" y="100" width="266" height="416" fill="#FBFBF5"/>
  <rect x="160" y="100" width="266" height="416" fill="url(#boxShade)"/>
  ${mark(293, 150, 1.1, color)}
  <text x="293" y="196" text-anchor="middle" ${FONT} font-size="12" font-weight="700" fill="${color}" letter-spacing="3">TRANZLIFE</text>
  <text x="293" y="234" text-anchor="middle" ${FONT} font-size="30" font-weight="800" fill="${color}" letter-spacing="-0.5">${sub}</text>
  <rect x="200" y="246" width="186" height="34" rx="17" fill="${color}"/>
  <text x="293" y="270" text-anchor="middle" ${FONT} font-size="21" font-weight="700" fill="#fff">${name}</text>
  <text x="293" y="304" text-anchor="middle" ${FONT} font-size="16" font-weight="800" fill="${color}" letter-spacing="2">GUMMIES</text>
  <g transform="translate(293 380)" fill="${color}" opacity="0.9">
    <path d="M-6 -48v34M-6 -14c-8 8-16 12-22 12M6 -14c8 8 16 12 22 12M6 -48v34" stroke="${color}" stroke-width="4" fill="none"/>
    <path d="M-12 -36c-34-6-54 30-54 64 0 22 8 34 24 34 22 0 30-14 30-36V-26c0-6-0-9-0-10Z"/>
    <path d="M12 -36c34-6 54 30 54 64 0 22-8 34-24 34-22 0-30-14-30-36V-26c0-6 0-9 0-10Z"/>
  </g>
  <rect x="160" y="456" width="266" height="60" fill="${color}"/>
  <text x="293" y="480" text-anchor="middle" ${FONT} font-size="11" font-weight="700" fill="#F2D27A" letter-spacing="2">NATURAL BERRY FLAVOUR</text>
  <text x="293" y="502" text-anchor="middle" ${FONT} font-size="13" font-weight="700" fill="#fff" letter-spacing="1">Net Quantity: 60 Gummies</text>
  `,
    `<linearGradient id="boxShade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.06"/></linearGradient>`
  );
}

/** Craving Control gummies: dark green jar with a gold lid. */
function darkJar({ name, sub, color }) {
  return svg(
    `
  ${shadow(300, 520, 140)}
  <rect x="178" y="170" width="244" height="350" rx="34" fill="${color}"/>
  <rect x="178" y="170" width="244" height="350" rx="34" fill="url(#shade)"/>
  <rect x="192" y="112" width="216" height="72" rx="14" fill="${GOLD}"/>
  <rect x="192" y="112" width="216" height="72" rx="14" fill="url(#shadeGold)"/>
  <rect x="192" y="244" width="216" height="210" rx="10" fill="#123620"/>
  ${mark(300, 296, 1.15, '#F2D27A')}
  <text x="300" y="348" text-anchor="middle" ${FONT} font-size="30" font-weight="700" fill="#fff" letter-spacing="-0.5">PulmoClear</text>
  <text x="300" y="372" text-anchor="middle" ${FONT} font-size="12.5" font-weight="700" fill="${GOLD}" letter-spacing="2">${name}</text>
  <rect x="222" y="388" width="156" height="26" rx="13" fill="${GOLD}"/>
  <text x="300" y="406" text-anchor="middle" ${FONT} font-size="11.5" font-weight="800" fill="#123620" letter-spacing="1.5">${sub}</text>
  <text x="300" y="440" text-anchor="middle" ${FONT} font-size="10" fill="#fff" opacity="0.75" letter-spacing="2">NUTRACEUTICAL · 60 GUMMIES</text>
  <g fill="#7A1F3A"><rect x="380" y="470" width="44" height="40" rx="12"/><rect x="410" y="490" width="44" height="40" rx="12" fill="#8E2A48"/></g>
  `,
    cylinder('shade', color) + cylinder('shadeGold', GOLD)
  );
}

const files = {
  'pulmoclear.svg': carton({ name: 'PulmoClear', sub: 'LUNG BOOSTER', color: '#1E5A2B' }),
  'craving-control-gummies.svg': darkJar({ name: 'CRAVING CONTROL GUMMIES', sub: 'FOR HEAVY SMOKERS', color: '#1F4A2E' }),
  'reviva.svg': rollOn({ name: 'Reviva', sub: 'DIABETES &amp; VITALITY', color: '#1E5A2B', band: '#D9822B', volume: '50 ml', tall: true }),
  'liverdetox.svg': syrupBottle({ name: 'LiverDetox', sub: 'LIVER BOOSTER', color: '#6F7F1E' }),
  'craving-control.svg': inhaler({ name: 'Craving|CONTROL', sub: 'AROMATHERAPY INHALER', color: '#2F8A4C' }),
  'craving-control-plus.svg': inhaler({ name: 'Craving|PLUS', sub: 'AROMATHERAPY INHALER', color: '#B98C2E' }),
  'craving-control-gold.svg': inhaler({ name: 'Craving|GOLD', sub: 'AROMATHERAPY INHALER', color: '#1E1E1E', label: GOLD }),
  'craving-control-night.svg': inhaler({ name: 'Craving|NIGHT', sub: 'AROMATHERAPY INHALER', color: '#5E3D96' }),
  'breathefree.svg': inhaler({ name: 'BreatheFree', sub: 'AROMATHERAPY INHALER', color: '#1F7A8C' }),
  'cyclerelief.svg': rollOn({ name: 'CycleRelief', sub: 'MENSTRUAL COMFORT', color: '#6E3F9B', band: '#6E3F9B', volume: '8 ml' }),
};

for (const [file, content] of Object.entries(files)) writeFileSync(join(out, file), content);
console.log(`Wrote ${Object.keys(files).length} pack illustrations to ${out}`);
