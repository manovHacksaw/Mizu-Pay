#!/bin/bash

# Build script for Mizu Pay Browser Extension
# Creates a zip file ready for Chrome Web Store submission

echo "🚀 Building Mizu Pay Browser Extension..."

# Create build directory
BUILD_DIR="build"
EXTENSION_NAME="mizu-pay-extension"
VERSION=$(grep '"version"' package.json | cut -d'"' -f4)

# Clean previous builds
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Copy extension files
echo "📦 Copying extension files..."
cp manifest.json $BUILD_DIR/
cp background.js $BUILD_DIR/
cp content.js $BUILD_DIR/
cp content.css $BUILD_DIR/
cp popup.html $BUILD_DIR/
cp popup.css $BUILD_DIR/
cp popup.js $BUILD_DIR/

# Create icons directory and placeholder icons
echo "🎨 Creating icon placeholders..."
mkdir -p $BUILD_DIR/icons

# Create simple SVG icons (will be converted to PNG in production)
cat > $BUILD_DIR/icons/icon.svg << 'EOF'
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00D4AA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00A8CC;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#grad)" stroke="#fff" stroke-width="4"/>
  <text x="64" y="75" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">💎</text>
</svg>
EOF

# Create README for build
cat > $BUILD_DIR/README.md << 'EOF'
# Mizu Pay Browser Extension v1.0.0

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select this folder
4. Pin the extension to your toolbar

## Usage

1. Navigate to any e-commerce checkout page
2. Click the floating "Pay with CELO" button
3. Complete payment on Mizu Pay platform

## Features

- Automatic checkout detection
- Pay with CELO integration
- Mobile compatible
- Lightweight and fast

For more information, visit: https://mizupay.com
EOF

# Create zip file
echo "📦 Creating zip package..."
cd $BUILD_DIR
zip -r ../${EXTENSION_NAME}-v${VERSION}.zip . -x "*.git*" "node_modules/*"
cd ..

# Clean up build directory
rm -rf $BUILD_DIR

echo "✅ Extension built successfully!"
echo "📁 Package: ${EXTENSION_NAME}-v${VERSION}.zip"
echo "📏 Size: $(du -h ${EXTENSION_NAME}-v${VERSION}.zip | cut -f1)"
echo ""
echo "🚀 Ready for Chrome Web Store submission!"
echo "   Upload: ${EXTENSION_NAME}-v${VERSION}.zip"
echo "   Or load unpacked folder for development"
