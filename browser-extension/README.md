# Mizu Pay Browser Extension

A comprehensive browser extension that detects checkout pages on e-commerce websites and enables payments with CELO cryptocurrency.

## Features

- 🔍 **Smart Checkout Detection**: Automatically detects checkout forms on major e-commerce sites
- 💎 **CELO Integration**: Convert fiat currencies to CELO and cUSD equivalents
- 🌐 **Multi-site Support**: Works with Amazon, Flipkart, Myntra, Nykaa, eBay, Etsy, Shopify, and more
- 📱 **Mobile Compatible**: Responsive design that works on all devices
- ⚡ **Lightweight**: Minimal impact on page performance
- 🔧 **Modular Architecture**: Easy to extend with new features

## Supported Sites

### Indian E-commerce
- **Flipkart** - Electronics, fashion, home & more
- **Amazon India** - Everything store
- **Myntra** - Fashion & lifestyle
- **Nykaa** - Beauty & cosmetics
- **BigBasket** - Groceries & essentials

### International E-commerce
- **Amazon** - Global marketplace
- **eBay** - Online auctions
- **Etsy** - Handmade & vintage
- **Shopify Stores** - Independent retailers

## Installation

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd browser-extension
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `browser-extension` folder

3. **Test the extension**:
   - Open `test-ecommerce.html` in your browser
   - You should see a floating "Pay with CELO" button
   - Click it to test the redirection

### Production Build

1. **Package the extension**:
   ```bash
   # Create a zip file of the extension
   zip -r mizu-pay-extension.zip . -x "*.git*" "*.md" "test-*"
   ```

2. **Upload to Chrome Web Store** (when ready for production)

## Architecture

### File Structure

```
browser-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content.js            # Content script for detection
├── content.css           # Styles for floating button
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── popup.css             # Popup styles
├── icons/                # Extension icons
│   ├── icon16.svg
│   ├── icon32.svg
│   ├── icon48.svg
│   └── icon128.svg
├── test-ecommerce.html   # Test page
└── README.md             # This file
```

### Core Components

#### 1. Background Service Worker (`background.js`)
- Manages extension lifecycle
- Handles storage and settings
- Processes conversion rates
- Coordinates communication between components

#### 2. Content Script (`content.js`)
- Detects checkout forms on web pages
- Extracts payment information (amount, currency, store)
- Displays floating "Pay with CELO" button
- Handles user interactions

#### 3. Popup UI (`popup.html`, `popup.js`, `popup.css`)
- Shows extension status and settings
- Displays detected checkout information
- Provides quick actions and configuration

## Configuration

### Settings

The extension supports various configuration options:

```javascript
{
  enabled: true,                    // Enable/disable extension
  showFloatingButton: true,         // Show floating button
  dappUrl: 'http://localhost:3000/payment',  // DApp URL
  conversionApi: 'https://api.coingecko.com/api/v3/simple/price',
  supportedSites: [...],            // List of supported sites
  currencyPreferences: {
    defaultCurrency: 'INR',
    targetCurrencies: ['CELO', 'cUSD'],
    conversionRate: 1.0
  }
}
```

### Adding New Sites

To add support for new e-commerce sites, update the `getSiteSpecificRules()` function in `content.js`:

```javascript
'newsite.com': {
  selectors: [
    '#checkout',
    '.checkout-form',
    '[data-testid*="checkout"]'
  ],
  amountSelectors: [
    '.total-price',
    '.order-total',
    '[data-testid*="total"]'
  ],
  storeName: 'New Site',
  currency: 'USD'
}
```

### Customizing Detection Logic

The extension uses multiple detection strategies:

1. **Site-specific rules**: Custom selectors for known sites
2. **Generic detection**: Common checkout patterns
3. **URL-based detection**: Checkout-related keywords in URLs

## API Integration

### Currency Conversion

The extension supports real-time currency conversion:

```javascript
// Example conversion API call
const rates = await chrome.runtime.sendMessage({
  action: 'getConversionRates',
  currency: 'INR',
  amount: 1000
});

// Response format
{
  originalAmount: 1000,
  originalCurrency: 'INR',
  conversions: {
    CELO: '0.1',
    cUSD: '12.0'
  },
  timestamp: 1640995200000
}
```

### DApp Integration

The extension redirects to your DApp with query parameters:

```
http://localhost:3000/payment?
  store=Flipkart&
  amount=1599&
  currency=INR&
  country=IN&
  description=Wireless+Headphones&
  returnUrl=https://flipkart.com/checkout&
  source=browser-extension&
  celoAmount=0.16&
  cusdAmount=19.2
```

## Development

### Testing

1. **Load the extension** in Chrome
2. **Open test pages**:
   - `test-ecommerce.html` - Comprehensive test page
   - Visit real e-commerce sites (Amazon, Flipkart, etc.)
3. **Check console logs** for detection status
4. **Test popup functionality** by clicking the extension icon

### Debugging

Enable debug logging:

```javascript
// In content.js
console.log('Checkout detected:', data);

// In background.js
console.log('Settings updated:', newSettings);
```

### Common Issues

1. **Extension not detecting checkout**:
   - Check if the site is in `supportedSites` list
   - Verify selectors in `getSiteSpecificRules()`
   - Check console for detection logs

2. **Floating button not appearing**:
   - Ensure `showFloatingButton` setting is enabled
   - Check if checkout is actually detected
   - Verify CSS is not being blocked

3. **Conversion rates not working**:
   - Check API endpoint in settings
   - Verify network connectivity
   - Check console for API errors

## Security

- **Content Security Policy**: Strict CSP to prevent XSS
- **Permissions**: Minimal required permissions
- **Data Handling**: No sensitive data stored locally
- **API Calls**: Secure HTTPS endpoints only

## Performance

- **Lightweight**: < 50KB total size
- **Efficient Detection**: Uses MutationObserver for minimal impact
- **Lazy Loading**: Components loaded only when needed
- **Memory Management**: Proper cleanup on page unload

## Future Enhancements

### Planned Features

1. **Multi-currency Support**: Support for more currencies
2. **Custom Conversion Rates**: User-defined conversion rates
3. **Site-specific Settings**: Per-site configuration
4. **Analytics**: Usage tracking and insights
5. **Offline Mode**: Cached conversion rates
6. **Mobile App**: Companion mobile application

### Extension Points

The architecture is designed for easy extension:

```javascript
// Add new detection method
class CustomDetector extends CheckoutDetector {
  detectCustomCheckout() {
    // Custom detection logic
  }
}

// Add new conversion API
class CustomConversionAPI {
  async getRates(currency, amount) {
    // Custom API integration
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Email**: support@mizupay.com
- **Discord**: [Mizu Pay Community](https://discord.gg/mizupay)

## Changelog

### v2.0.0
- Complete rewrite with modular architecture
- Enhanced checkout detection
- Real-time currency conversion
- Mobile-responsive design
- Comprehensive test suite

### v1.0.0
- Initial release
- Basic checkout detection
- Simple CELO integration
- Chrome extension support