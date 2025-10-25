# Mizu Pay Extension Debugging Guide

## Why the "Pay with CELO" Button Isn't Appearing

The floating button might not appear due to several reasons. Follow this step-by-step guide to debug and fix the issue.

## Step 1: Check Extension Status

1. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Find "Mizu Pay - Pay with CELO"
   - Make sure it's **enabled** (toggle should be blue)

2. **Check Extension Icon**:
   - Look for the Mizu Pay icon in your browser toolbar
   - If you don't see it, the extension isn't loaded properly

## Step 2: Test with Simple Page

1. **Open the test page**:
   - Open `simple-test.html` in your browser
   - This page is designed to trigger the extension

2. **Check browser console**:
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for messages starting with "🚀 Mizu Pay"

## Step 3: Manual Debug

1. **Open the test page** (`simple-test.html`)
2. **Click "Run Debug Checks"** button
3. **Check the console output** for any error messages

## Step 4: Force Show Button

1. **On the test page**, click **"Force Show Button"**
2. **You should see a floating button** in the bottom-right corner
3. **Click the button** to test if it works

## Step 5: Check Extension Settings

1. **Click the Mizu Pay extension icon** in your browser toolbar
2. **Check the popup**:
   - Extension should be enabled
   - "Show Floating Button" should be checked
   - DApp URL should be set to `http://localhost:3000/payment`

## Common Issues and Solutions

### Issue 1: Extension Not Detecting Checkout

**Symptoms**: No floating button appears on checkout pages

**Solutions**:
1. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Click the reload button (🔄) on the Mizu Pay extension

2. **Check if you're on a checkout page**:
   - The page should have checkout-related elements
   - URL should contain words like "checkout", "payment", "order"

3. **Try the test page**:
   - Open `simple-test.html`
   - This page is guaranteed to trigger the extension

### Issue 2: Extension Settings Not Working

**Symptoms**: Extension popup shows but settings don't work

**Solutions**:
1. **Clear extension storage**:
   - Open `debug-extension.html`
   - Click "Clear All Storage"
   - Click "Set Localhost URL"
   - Click "Reload Extension"

2. **Check console for errors**:
   - Press F12 → Console
   - Look for any error messages

### Issue 3: Floating Button Not Clickable

**Symptoms**: Button appears but doesn't respond to clicks

**Solutions**:
1. **Check z-index conflicts**:
   - The button should have `z-index: 10000`
   - Other elements might be covering it

2. **Check for JavaScript errors**:
   - Open Developer Tools → Console
   - Look for any error messages

### Issue 4: Extension Not Loading

**Symptoms**: No extension icon in toolbar

**Solutions**:
1. **Reinstall the extension**:
   - Remove from `chrome://extensions/`
   - Reload the extension folder

2. **Check manifest.json**:
   - Make sure it's valid JSON
   - Check for any syntax errors

## Debug Tools

### 1. Simple Test Page
- **File**: `simple-test.html`
- **Purpose**: Test extension detection
- **Features**: Debug buttons, console logging

### 2. Debug Extension Page
- **File**: `debug-extension.html`
- **Purpose**: Clear storage and reset settings
- **Features**: Storage management, extension reload

### 3. Console Debug Script
- **File**: `debug-detection.js`
- **Purpose**: Advanced debugging
- **Usage**: Run in browser console

## Manual Testing Steps

1. **Load the extension** in Chrome
2. **Open `simple-test.html`**
3. **Check console for messages**:
   ```
   🚀 Mizu Pay Content Script Starting...
   🔍 Checking for checkout...
   ✅ Found checkout element: .checkout
   ✅ Checkout detected! Showing floating button...
   💎 Showing floating button...
   ✅ Floating button created and added to page
   ```
4. **Look for floating button** in bottom-right corner
5. **Click the button** to test redirection

## Expected Behavior

When working correctly, you should see:

1. **Console messages** indicating detection
2. **Floating button** in bottom-right corner
3. **Button click** opens new tab with your DApp
4. **URL parameters** include store, amount, currency, etc.

## Still Not Working?

If the button still doesn't appear:

1. **Try the simplified content script**:
   - Replace `content.js` with `content-simple.js`
   - Reload the extension

2. **Check browser compatibility**:
   - Make sure you're using Chrome (not Firefox, Safari, etc.)
   - Update Chrome to the latest version

3. **Check for conflicts**:
   - Disable other extensions temporarily
   - Try in incognito mode

4. **Manual button creation**:
   - Use the "Force Show Button" feature
   - This bypasses detection and creates the button manually

## Getting Help

If you're still having issues:

1. **Check the console** for error messages
2. **Try the debug tools** provided
3. **Test with the simple test page** first
4. **Make sure your DApp is running** on localhost:3000

The extension should work with the test pages provided. If it doesn't work there, there's a configuration issue that needs to be resolved first.
