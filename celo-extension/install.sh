#!/bin/bash

# CELO Pay Extension Installation Script
# This script helps set up the extension for development

echo "🌱 CELO Pay Extension Setup"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the extension directory."
    exit 1
fi

echo "✅ Extension files found"

# Create icons directory if it doesn't exist
if [ ! -d "icons" ]; then
    echo "📁 Creating icons directory..."
    mkdir -p icons
fi

# Check if icon files exist
if [ ! -f "icons/icon16.png" ] || [ ! -f "icons/icon32.png" ] || [ ! -f "icons/icon48.png" ] || [ ! -f "icons/icon128.png" ]; then
    echo "⚠️  Warning: Icon files are missing. Please add the following files:"
    echo "   - icons/icon16.png (16x16 pixels)"
    echo "   - icons/icon32.png (32x32 pixels)"
    echo "   - icons/icon48.png (48x48 pixels)"
    echo "   - icons/icon128.png (128x128 pixels)"
    echo ""
    echo "You can create these from the celo-logo.svg file using an image editor."
fi

# Check for required files
required_files=("manifest.json" "background.js" "content.js" "content.css" "popup.html" "popup.js" "conversion-api.js" "celo-logo.svg")

echo "🔍 Checking required files..."
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
    fi
done

echo ""
echo "📋 Installation Instructions:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top-right corner)"
echo "3. Click 'Load unpacked' and select this directory"
echo "4. Pin the extension to your toolbar"
echo "5. Test on an e-commerce website (e.g., Amazon, Shopify store)"

echo ""
echo "⚙️  Configuration:"
echo "- Edit background.js to change the DApp URL (default: http://localhost:3000)"
echo "- Edit content.js to customize checkout detection rules"
echo "- Edit conversion-api.js to update currency conversion settings"

echo ""
echo "🚀 Ready to use! The extension will automatically detect checkout pages and show a floating CELO payment option."

echo ""
echo "📚 For more information, see README.md"
