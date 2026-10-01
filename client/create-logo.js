import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy SVG or create PNG placeholder that points directly to logo
const svgPath = path.join(__dirname, 'public', 'logo.svg');
const pngPath = path.join(__dirname, 'public', 'logo.png');

// If logo.png doesn't exist, create a valid PNG
if (!fs.existsSync(pngPath)) {
  // 1x1 transparent PNG fallback buffer then updated
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  fs.writeFileSync(pngPath, Buffer.from(pngBase64, 'base64'));
}
console.log('Logo ready at public/logo.png and public/logo.svg');
