export function Hero() {
  return (
    <div className="relative z-10 text-center px-5 pt-32 md:pt-40 pb-24 md:pb-32 max-w-[1100px] mx-auto">
      {/* Main Headline */}
      <h1 className="animate-headline text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 text-primary">
        Make Use of{' '}
        <span className="animate-highlight text-gradient">
          Your Crypto
        </span>
        <br />
        on Any E-commerce Site
      </h1>

      {/* Subtitle */}
      <p className="animate-subtext text-base text-secondary mb-10 font-normal max-w-2xl mx-auto">
        Transform your cUSD and CELO into real purchases. Pay securely on any online store that accepts gift cards while contributing to ReFi projects.
      </p>

      {/* Badge */}
      <div className="animate-badge hidden lg:flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-2 nav-badge px-4 py-2 rounded-full text-sm">
          <div className="w-4 h-4 nav-badge-dot rounded-full"></div>
          <span>Trusted by +20k people</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="animate-cta flex flex-col sm:flex-row gap-4 justify-center items-center mb-5">
        <button className="btn-primary px-8 py-3.5 rounded-md text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl">
          Get Extension
        </button>
        <button className="btn-secondary backdrop-blur-md border px-8 py-3.5 rounded-md text-sm font-semibold transition-all hover:-translate-y-0.5">
          Watch Demo
        </button>
      </div>
    </div>
  );
}

