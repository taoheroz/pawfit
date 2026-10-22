// Draws the PawFit app icons (cat face on a soft green tile) as PNGs in public/icons/.
import sharp from 'sharp';
const cat = (s = 1) => `<g transform="translate(256 300) scale(${s}) translate(-100 -110)">
  <path d="M148 146q40-6 34-52" stroke="#E8964A" stroke-width="13" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="134" rx="54" ry="38" fill="#F2A65A"/><ellipse cx="100" cy="144" rx="31" ry="23" fill="#FCE3C4"/>
  <path d="M62 112q38 16 76 0v11q-38 16-76 0z" fill="#D2463A"/>
  <path d="M60 58l4-38 30 22z" fill="#F2A65A"/><path d="M140 58l-4-38-30 22z" fill="#F2A65A"/>
  <path d="M66 50l3-20 15 12z" fill="#F7B6A3"/><path d="M134 50l-3-20-15 12z" fill="#F7B6A3"/>
  <circle cx="100" cy="80" r="46" fill="#F2A65A"/>
  <path d="M90 38q10 7 20 0M84 46q16 9 32 0" stroke="#D9823A" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M76 80q8-9 16 0M108 80q8-9 16 0" stroke="#3A2A20" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="70" cy="93" rx="8" ry="4.5" fill="#F27E7E" opacity=".5"/><ellipse cx="130" cy="93" rx="8" ry="4.5" fill="#F27E7E" opacity=".5"/>
  <path d="M95 90l5 5 5-5z" fill="#DE7777"/>
  <path d="M91 99q4.5 5 9 0q4.5 5 9 0" stroke="#3A2A20" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M58 90l-18-3M58 97l-17 4M142 90l18-3M142 97l17 4" stroke="#C9874F" stroke-width="2" stroke-linecap="round"/></g>`;
const tile = (s, round) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><radialGradient id="g" cx="30%" cy="85%" r="90%"><stop offset="0" stop-color="#BFE3C8"/><stop offset=".6" stop-color="#DDF0E1"/><stop offset="1" stop-color="#FFF4D2"/></radialGradient></defs>
  <rect width="512" height="512" rx="${round}" fill="url(#g)"/>
  <circle cx="400" cy="110" r="36" fill="#F5C443" opacity=".55"/>
  ${cat(s)}</svg>`;
const out = async (svg, size, name) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(`public/icons/${name}`);
await out(tile(2.15, 0), 180, 'apple-touch-icon.png');
await out(tile(2.15, 112), 192, 'icon-192.png');
await out(tile(2.15, 112), 512, 'icon-512.png');
await out(tile(1.7, 0), 512, 'maskable-512.png');
await out(tile(2.15, 112), 64, 'favicon-64.png');
console.log('icons done');
