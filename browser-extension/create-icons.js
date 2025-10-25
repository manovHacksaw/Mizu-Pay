// Simple script to create extension icons
// Run with: node create-icons.js

const fs = require('fs');
const path = require('path');

// Simple PNG data for a 16x16 icon with diamond emoji
const createSimpleIcon = (size) => {
  // This is a minimal PNG with a gradient background and diamond
  // For production, you'd want to use proper image generation libraries
  
  // For now, let's create a simple colored square
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00D4AA;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00A8CC;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#grad)" stroke="white" stroke-width="1"/>
      <text x="${size/2}" y="${size/2 + 2}" font-family="Arial" font-size="${size * 0.5}" text-anchor="middle" fill="white">💎</text>
    </svg>
  `;
  
  return canvas;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Create SVG files for now (Chrome will accept them)
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const svgContent = createSimpleIcon(size);
  const filename = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(filename, svgContent);
  console.log(`Created ${filename}`);
});

console.log('Icons created! Note: For production, convert these SVG files to PNG format.');
