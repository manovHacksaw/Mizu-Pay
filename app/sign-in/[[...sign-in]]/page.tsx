import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mizu Pay</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
