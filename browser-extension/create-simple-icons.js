const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create simple SVG icons
const createIcon = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#00D4AA;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#00A8CC;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#grad${size})" stroke="white" stroke-width="1"/>
    <text x="${size/2}" y="${size/2 + 2}" font-family="Arial" font-size="${size * 0.4}" text-anchor="middle" fill="white">M</text>
  </svg>`;
};

// Create all required icon sizes
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const svgContent = createIcon(size);
  const filename = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(filename, svgContent);
  console.log(`Created ${filename}`);
});

console.log('All icons created successfully!');
