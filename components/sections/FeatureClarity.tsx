export function FeatureClarity() {
  const features = [
    {
      title: "Pay with Crypto Anywhere",
      description: "Spend your crypto online without converting it to cash. Just choose an amount and checkout.",
      visual: (
        <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-4 h-48 flex flex-col items-center justify-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-4 left-4 w-16 h-16 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/10 rounded-full"></div>
          
          {/* Credit Card */}
          <div className="relative z-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 w-full max-w-[200px] shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-xs font-semibold">Mizu Pay</span>
              <span className="text-white text-xs font-bold"></span>
            </div>
            <div className="text-white text-xs mb-2">132 cUSD</div>
            <div className="text-white text-sm font-mono tracking-wider">  0xA3F4...98C2    </div>
          </div>
          
          {/* Currency indicators */}
          <div className="absolute bottom-2 left-4 flex gap-2">
            <div className="bg-white/80 rounded-full px-3 py-1 text-xs font-semibold">cUSD</div>
            <div className="bg-white/80 rounded-full px-3 py-1 text-xs font-semibold">CELO</div>
          </div>
        </div>
      ),
    },
    {
      title: "Instant Gift Card Delivery",
      description: "Receive your gift card immediately after payment. Redeem it instantly and start shopping.",
      visual: (
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-4 h-48 flex flex-col items-center justify-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-4 left-4 w-16 h-16 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/20 rounded-full"></div>
          
          {/* Icons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
            </div>
            <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
              <span className="text-yellow-900 text-xs font-bold">⚡</span>
            </div>
          </div>
          
          {/* Credit Card */}
          <div className="relative z-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 w-full max-w-[180px] shadow-lg rotate-12">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-semibold">Myntra </span>
              <span className="text-white text-xs font-bold">₹3000</span>
            </div>
          </div>
          
          {/* FX Rate and Speed indicators */}
          <div className="absolute bottom-2 left-4 right-4 flex gap-2">
            <div className="bg-white/90 rounded px-2 py-1 text-xs font-semibold flex-1">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-l-2 border-b-2 border-blue-600 transform rotate-45"></div>
                <span>USD 0.01 = SGD 1.3479</span>
              </div>
            </div>
            <div className="bg-blue-600 text-white rounded px-2 py-1 text-xs font-semibold flex items-center gap-1">
              <span>10x faster</span>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Simple, Wallet-Based Checkout",
      description: "Connect your wallet and pay in seconds. No KYC, no sign-ups, no complexity.",
      visual: (
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-4 h-48 flex flex-col items-center justify-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-4 left-4 w-16 h-16 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/20 rounded-full"></div>
          
          {/* Security/Blockchain icons */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🔗</span>
            </div>
          </div>
          
          {/* Transaction cards */}
          <div className="relative z-10 space-y-2 w-full max-w-[220px]">
            <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">SECURE</span>
                <span className="text-xs font-semibold text-green-600">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Blockchain</span>
                <span className="text-sm font-bold text-gray-900">ReFi</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">VERIFIED</span>
                <span className="text-xs font-semibold text-green-600">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">CELO Network</span>
                <span className="text-sm font-bold text-gray-900">cUSD</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="relative py-20 md:py-32 px-5" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Tagline */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 text-sm md:text-base font-medium" style={{ color: 'var(--content-text-secondary)' }}>
            <span className="text-yellow-500">⚡</span>
            Built for fast-growing teams
          </span>
        </div>

        {/* Section Headline */}
        <h2 
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4" 
          style={{ color: 'var(--foreground)' }}
        >
          Pay for what you love using crypto with{' '}
          <span style={{ color: '#0A4DFF' }}>Mizu Pay</span>
        </h2>

        {/* One-sentence clarifier */}
        <p 
          className="text-base md:text-lg text-center mb-12 md:mb-16 max-w-2xl mx-auto" 
          style={{ color: 'var(--content-text-secondary)' }}
        >
          Transform your cUSD and CELO into real purchases on any e-commerce site.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-bg  rounded-xl p-6 md:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Visual */}
              {feature.visual}
              
              {/* Title */}
              <h3 
                className="text-lg md:text-xl font-bold mb-2" 
                style={{ color: 'var(--foreground)' }}
              >
                {feature.title}
              </h3>
              
              {/* Description */}
              <p 
                className="text-sm md:text-base leading-relaxed" 
                style={{ color: 'var(--content-text-secondary)' }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

