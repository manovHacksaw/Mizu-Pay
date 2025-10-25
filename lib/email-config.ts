// Email configuration following Chingu's exact pattern
// Simple and clean configuration like Chingu

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'nodemailer' | 'console'
  apiKey?: string
  fromEmail?: string
  fromName?: string
}

// Following Chingu's simple configuration approach
export const emailConfig: EmailConfig = {
  provider: 'resend',
  fromEmail: 'noreply@mizu-pay.com',
  fromName: 'Mizu Pay',
  apiKey: process.env.RESEND_API_KEY || 're_jgeAFYyS_FbLHoLA197Mn4iWnLpsL5Mrn'
}