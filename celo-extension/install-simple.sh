#!/bin/bash

echo "🌱 CELO Pay Extension - Simple Stable Version"
echo "============================================="

# Backup original files
if [ -f "manifest.json" ]; then
    echo "📦 Backing up original manifest..."
    cp manifest.json manifest-original.json
fi

# Use simple stable version
echo "🔄 Switching to simple stable version..."
cp manifest-simple.json manifest.json

echo "✅ Simple stable version ready!"
echo ""
echo "📋 Installation Instructions:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top-right corner)"
echo "3. Click 'Load unpacked' and select this directory"
echo "4. The extension will now redirect to http://localhost:3000/payment"
echo ""
echo "🧪 Test the extension:"
echo "1. Open test-checkout.html in Chrome"
echo "2. Look for the green 'Pay with CELO' button"
echo "3. Click it to test the redirect to your payment page"
echo ""
echo "⚙️ Features:"
echo "- No animations or transitions"
echo "- Simple checkout detection"
echo "- Direct redirect to your payment page"
echo "- Stable and lightweight"
