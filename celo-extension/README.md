# CELO Pay Browser Extension

A Chrome extension that enables seamless payments with CELO and cUSD on any e-commerce website. The extension automatically detects checkout pages and provides a floating CELO payment option.

## Features

- 🔍 **Automatic Checkout Detection**: Detects checkout pages on major e-commerce sites
- 💰 **Dynamic Data Extraction**: Extracts store name, amount, currency, and product details
- 🌱 **CELO Integration**: Converts amounts to CELO and cUSD equivalents
- 🚀 **Seamless Redirect**: Redirects to your DApp with all checkout data
- ⚙️ **Configurable Settings**: Customizable detection rules and API endpoints
- 🎨 **Modern UI**: Clean, responsive popup interface

## Installation

### Development Setup

1. **Clone or download** this extension to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Production Installation

1. Package the extension as a `.zip` file
2. Upload to Chrome Web Store (requires developer account)
3. Users can install from the Chrome Web Store

## Configuration

### DApp URL Setup

Edit `background.js` and update the default DApp URL:

```javascript
dappUrl: 'http://localhost:3000', // Change to your DApp URL
```

### Currency Conversion API

The extension uses multiple fallback APIs for currency conversion:

1. **Primary**: `https://api.exchangerate-api.com/v4/latest/`
2. **Fallback**: `https://api.fixer.io/latest`
3. **Hardcoded**: Fallback rates for offline functionality

### Customization Points

#### 1. Checkout Detection Rules

Edit `content.js` to customize detection:

```javascript
const CHECKOUT_CONFIG = {
  checkoutKeywords: [
    'checkout', 'cart', 'payment', 'billing', 'order'
    // Add your custom keywords
  ],
  
  selectors: {
    amount: [
      '[data-testid*="total"]',
      '.total', '.amount', '.price'
      // Add your custom selectors
    ]
  }
};
```

#### 2. E-commerce Platform Support

Add support for new platforms by extending selectors:

```javascript
selectors: {
  // Add platform-specific selectors
  amazon: {
    amount: ['.a-price-whole'],
    store: ['#nav-logo-sprites']
  },
  shopify: {
    amount: ['.cart-total'],
    store: ['.site-header__logo']
  }
}
```

#### 3. Currency Conversion

Update conversion rates in `conversion-api.js`:

```javascript
const CONVERSION_CONFIG = {
  fallbackRates: {
    'USD': 1.0,
    'EUR': 0.85,
    // Add more currencies
  },
  
  celoPriceUSD: 0.50, // Update CELO price
  cusdPriceUSD: 1.00  // Update cUSD price
};
```

## Usage

### For Users

1. **Install the extension** from Chrome Web Store
2. **Navigate to any e-commerce site** (Amazon, Shopify stores, etc.)
3. **Go to checkout page** - the extension will automatically detect it
4. **Click the floating CELO icon** when it appears
5. **Complete payment** in your CELO DApp

### For Developers

#### Adding New Detection Rules

1. **Identify checkout patterns** on target websites
2. **Add selectors** to `CHECKOUT_CONFIG.selectors`
3. **Test detection** on various pages
4. **Update keywords** if needed

#### Customizing Data Extraction

1. **Analyze page structure** of target sites
2. **Add selectors** for store name, amount, currency
3. **Test extraction** with different products
4. **Handle edge cases** (multiple currencies, discounts, etc.)

#### API Integration

1. **Choose conversion API** (or use multiple for reliability)
2. **Update API endpoints** in `conversion-api.js`
3. **Add error handling** for API failures
4. **Implement caching** for better performance

## File Structure

```
celo-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content.js            # Content script for detection
├── content.css           # Content script styles
├── popup.html           # Extension popup UI
├── popup.js             # Popup functionality
├── conversion-api.js    # Currency conversion logic
├── celo-logo.svg        # CELO logo for UI
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## API Reference

### Background Script Messages

```javascript
// Checkout detected
chrome.runtime.sendMessage({
  type: 'CHECKOUT_DETECTED',
  data: {
    store: 'Amazon',
    amount: '29.99',
    currency: 'USD',
    product_name: 'Wireless Headphones'
  }
});

// Open DApp with data
chrome.runtime.sendMessage({
  type: 'OPEN_DAPP',
  data: checkoutData
});

// Get conversion rate
chrome.runtime.sendMessage({
  type: 'GET_CONVERSION_RATE',
  fromCurrency: 'EUR',
  toCurrency: 'USD'
});
```

### Content Script Messages

```javascript
// Re-evaluate page
chrome.tabs.sendMessage(tabId, {
  type: 'REEVALUATE_PAGE'
});
```

## Troubleshooting

### Common Issues

1. **Extension not detecting checkout**
   - Check if site is in blacklist
   - Verify detection keywords match page content
   - Test with different e-commerce sites

2. **Data extraction failing**
   - Inspect page structure for changes
   - Update selectors for new layouts
   - Check for JavaScript-rendered content

3. **Conversion API errors**
   - Verify API endpoints are accessible
   - Check for rate limiting
   - Test with fallback rates

### Debug Mode

Enable debug logging by opening Chrome DevTools:

1. **Right-click extension icon** → "Inspect popup"
2. **Check Console tab** for debug messages
3. **Look for "CELO Pay Extension:" prefixed logs**

## Security Considerations

- **No sensitive data storage** - checkout data is temporary
- **HTTPS only** - all API calls use secure connections
- **Minimal permissions** - only requests necessary access
- **No tracking** - extension doesn't collect user data

## Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@celopay.com or create an issue in the repository.

---

**Built with ❤️ for the CELO ecosystem**
