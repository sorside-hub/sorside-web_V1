import sharp from 'sharp';

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#0a0a0a"/>
  <text x="256" y="276" fill="#f5f5f5" font-family="sans-serif" font-size="280" font-weight="bold" text-anchor="middle" dominant-baseline="middle">S</text>
  <circle cx="256" cy="256" r="230" fill="none" stroke="#ef233c" stroke-width="12"/>
</svg>`;

async function generateIcons() {
  console.log('Generating PWA icons...');
  await sharp(Buffer.from(svgString)).resize(192, 192).png().toFile('public/pwa-192x192.png');
  await sharp(Buffer.from(svgString)).resize(512, 512).png().toFile('public/pwa-512x512.png');
  await sharp(Buffer.from(svgString)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  console.log('Done.');
}

generateIcons();
