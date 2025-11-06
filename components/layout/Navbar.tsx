import { ThemeToggle } from "../ThemeToggle"

export function Navbar() {
  return (
    <nav className="animate-nav  top-0 left-0 right-0 z-50 flex justify-center items-center px-8 md:px-72 py-4">
      <div className="flex items-center justify-between gap-4 md:gap-8 w-full max-w-7xl rounded-2xl px-4 md:px-6 py-3 bg-blue backdrop-blur-md border border-white/30 dark:border-gray-700/40 shadow-lg">
      

        {/* Navigation Links */}
        <div className="flex items-center gap-6 lg:gap-8 flex-1">
          <a href="#home" className="text-sm font-medium text-primary nav-link transition-colors hover:text-gradient">
            Home
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-primary nav-link transition-colors hover:text-gradient"
          >
            Pricing
          </a>
          <a href="#docs" className="text-sm font-medium text-primary nav-link transition-colors hover:text-gradient">
            Docs
          </a>
          <a  
            href="#projects"
            className="text-sm font-medium text-primary nav-link transition-colors hover:text-gradient"
          >
            Projects
          </a>
        </div>

        {/* Right: Theme Toggle and Get Started Button */}
        <div className="flex items-center gap-4 shrink-0">
          <ThemeToggle />
          <button className="bg-white/10 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}
