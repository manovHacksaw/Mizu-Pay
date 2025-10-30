import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Provider } from '@/components/Provider';
import UserSync from '@/components/user-sync';
import GlobalLoader from '@/components/ui/global-loader';
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Mizu Pay - Web3 Payment Platform",
  description: "Secure Web3 payments with Google OAuth and multi-wallet support",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/mizu-pay-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/mizu-pay-logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/mizu-pay-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${ubuntu.variable} font-sans antialiased`}
        >
          <Provider>
            <GlobalLoader />
            <UserSync />
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
