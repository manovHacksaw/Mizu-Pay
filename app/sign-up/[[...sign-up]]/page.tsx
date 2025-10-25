import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-[clamp(4rem,8vw,6rem)] font-black leading-[0.85] tracking-[-0.02em] text-white mb-6">Join Mizu Pay</h1>
            <p className="text-white/90 text-[clamp(1.5rem,3vw,2rem)] font-medium">Create your account to get started</p>
          </div>

          {/* Right Side - Form */}
          <div className="w-full">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-white text-black hover:bg-white/90 font-medium py-4 px-6 rounded-lg transition-all duration-200 font-sans text-lg',
                  card: 'bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl p-8',
                  headerTitle: 'text-white text-3xl font-bold font-sans',
                  headerSubtitle: 'text-white/70 font-sans text-lg',
                  socialButtonsBlockButton: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 font-sans text-lg',
                  formFieldInput: 'bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg font-sans text-lg py-4 px-4',
                  formFieldLabel: 'text-white/70 font-sans text-lg',
                  footerActionLink: 'text-white hover:text-white/70 font-sans text-lg',
                  identityPreviewText: 'text-white/70 font-sans text-lg',
                  formResendCodeLink: 'text-white hover:text-white/70 font-sans text-lg',
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
