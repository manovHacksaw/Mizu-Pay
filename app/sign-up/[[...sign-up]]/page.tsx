import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="url(#paint0_linear)" />
              <text x="16" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial">
                M
              </text>
              <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00D4FF" />
                  <stop offset="1" stopColor="#0099CC" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join Mizu Pay</h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200',
              card: 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl',
              headerTitle: 'text-white text-2xl font-bold',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200',
              formFieldInput: 'bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg',
              formFieldLabel: 'text-gray-300',
              footerActionLink: 'text-cyan-400 hover:text-cyan-300',
              identityPreviewText: 'text-gray-300',
              formResendCodeLink: 'text-cyan-400 hover:text-cyan-300',
            }
          }}
        />
      </div>
    </div>
  )
}
