const sharp = require("sharp");
const { join } = require("path");

const out = join(process.cwd(), "assets");

async function main() {
  const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a2a1a"/>
      <stop offset="100%" stop-color="#0d3d2a"/>
    </linearGradient>
    <linearGradient id="moon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FDF6E3"/>
      <stop offset="100%" stop-color="#E9C46A"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="224" fill="url(#bg)"/>
  <rect x="32" y="32" width="960" height="960" rx="196" fill="none" stroke="#D4AF37" stroke-width="4" opacity="0.3"/>
  <circle cx="512" cy="340" r="180" fill="url(#moon)"/>
  <circle cx="600" cy="300" r="140" fill="#0a2a1a"/>
  <polygon points="512,160 530,210 584,210 540,242 554,294 512,262 470,294 484,242 440,210 494,210" fill="#E9C46A"/>
  <g transform="translate(256, 480)">
    <path d="M0 60 Q128 20 256 60 L256 340 Q128 300 0 340 Z" fill="#1a5a3a" stroke="#D4AF37" stroke-width="3"/>
    <path d="M256 60 Q384 20 512 60 L512 340 Q384 300 256 340 Z" fill="#1a5a3a" stroke="#D4AF37" stroke-width="3"/>
    <line x1="256" y1="60" x2="256" y2="340" stroke="#D4AF37" stroke-width="3" opacity="0.6"/>
    <text x="256" y="220" font-family="serif" font-size="72" fill="#E9C46A" text-anchor="middle" font-weight="bold" opacity="0.9">نور</text>
  </g>
  <circle cx="180" cy="200" r="4" fill="#E9C46A" opacity="0.6"/>
  <circle cx="844" cy="180" r="3" fill="#E9C46A" opacity="0.5"/>
  <circle cx="800" cy="400" r="3" fill="#E9C46A" opacity="0.4"/>
  <circle cx="224" cy="420" r="3" fill="#E9C46A" opacity="0.5"/>
</svg>`;

  await sharp(Buffer.from(iconSvg)).resize(1024, 1024).png().toFile(join(out, "icon.png"));
  console.log("✓ icon.png (1024×1024)");

  const adapSvg = iconSvg.replace(
    '<rect width="1024" height="1024" rx="224" fill="url(#bg)"/>',
    '<rect width="1024" height="1024" fill="transparent"/>'
  );
  await sharp(Buffer.from(adapSvg)).resize(1024, 1024).png().toFile(join(out, "adaptive-icon.png"));
  console.log("✓ adaptive-icon.png");

  await sharp(Buffer.from(iconSvg)).resize(200, 200).png().toFile(join(out, "splash-icon.png"));
  console.log("✓ splash-icon.png (200×200)");

  const favSvg = iconSvg.replace(
    '<rect width="1024" height="1024" rx="224" fill="url(#bg)"/>',
    '<rect width="48" height="48" rx="10" fill="#0a2a1a"/>'
  );
  await sharp(Buffer.from(favSvg)).resize(48, 48).png().toFile(join(out, "favicon.png"));
  console.log("✓ favicon.png (48×48)");

  const featSvg = `<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgF" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a2a1a"/>
      <stop offset="100%" stop-color="#0d3d2a"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bgF)"/>
  <g opacity="0.04">
    <circle cx="55" cy="60" r="30" fill="#E9C46A"/>
    <circle cx="110" cy="440" r="25" fill="#E9C46A"/>
    <circle cx="165" cy="60" r="40" fill="#E9C46A"/>
    <circle cx="220" cy="440" r="20" fill="#E9C46A"/>
    <circle cx="275" cy="60" r="35" fill="#E9C46A"/>
    <circle cx="330" cy="440" r="25" fill="#E9C46A"/>
    <circle cx="385" cy="60" r="30" fill="#E9C46A"/>
    <circle cx="440" cy="440" r="40" fill="#E9C46A"/>
    <circle cx="495" cy="60" r="20" fill="#E9C46A"/>
    <circle cx="550" cy="440" r="35" fill="#E9C46A"/>
    <circle cx="605" cy="60" r="25" fill="#E9C46A"/>
    <circle cx="660" cy="440" r="30" fill="#E9C46A"/>
    <circle cx="715" cy="60" r="40" fill="#E9C46A"/>
    <circle cx="770" cy="440" r="20" fill="#E9C46A"/>
    <circle cx="825" cy="60" r="35" fill="#E9C46A"/>
    <circle cx="880" cy="440" r="25" fill="#E9C46A"/>
    <circle cx="935" cy="60" r="30" fill="#E9C46A"/>
    <circle cx="990" cy="440" r="40" fill="#E9C46A"/>
  </g>
  <circle cx="240" cy="180" r="70" fill="#FDF6E3" opacity="0.9"/>
  <circle cx="280" cy="155" r="55" fill="#0a2a1a"/>
  <polygon points="240,120 249,146 276,146 254,162 262,188 240,172 218,188 226,162 204,146 231,146" fill="#E9C46A"/>
  <text x="440" y="200" font-family="serif" font-size="56" fill="#FDF6E3" font-weight="bold">Noor del Conocimiento</text>
  <text x="440" y="250" font-family="serif" font-size="22" fill="#E9C46A" font-style="italic">Islamic Trivia · Light of Knowledge</text>
  <text x="440" y="290" font-family="serif" font-size="18" fill="#D4AF37" opacity="0.7">Sira · Profetas · Corán · Historia Islámica</text>
  <line x1="0" y1="460" x2="1024" y2="460" stroke="#D4AF37" stroke-width="2" opacity="0.3"/>
  <text x="512" y="485" font-family="serif" font-size="14" fill="#D4AF37" text-anchor="middle" opacity="0.5">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</text>
</svg>`;

  await sharp(Buffer.from(featSvg)).resize(1024, 500).png().toFile(join(out, "feature-graphic.png"));
  console.log("✓ feature-graphic.png (1024×500)");

  console.log("\n✅ All assets generated!");
}

main().catch(console.error);
