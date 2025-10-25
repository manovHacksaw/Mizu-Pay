// Resend configuration with your API key and email settings
// This file contains your Resend setup

export const resendConfig = {
  apiKey: 're_Ghc1XAEZ_EV163ho4zFMZp19ykCYWVWRF',
  fromEmail: 'manovmandal@gmail.com',
  fromName: 'MIZU PAY',
  provider: 'resend' as const
}

// Environment variables setup
export const envSetup = `
# Add these to your .env.local file:

RESEND_API_KEY=re_Ghc1XAEZ_EV163ho4zFMZp19ykCYWVWRF
EMAIL_PROVIDER=resend
EMAIL_FROM=manovmandal@gmail.com
EMAIL_FROM_NAME=MIZU PAY
`

// Test configuration
export function testResendConfig() {
  console.log('🔧 Testing Resend Configuration:')
  console.log('   API Key:', resendConfig.apiKey.substring(0, 10) + '...')
  console.log('   From Email:', resendConfig.fromEmail)
  console.log('   From Name:', resendConfig.fromName)
  console.log('   Provider:', resendConfig.provider)
  
  return {
    apiKey: resendConfig.apiKey,
    fromEmail: resendConfig.fromEmail,
    fromName: resendConfig.fromName,
    provider: resendConfig.provider
  }
}
