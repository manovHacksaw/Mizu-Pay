import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Providers from "@/components/Providers";
import { Toaster } from "@/lib/toast";

const jakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Mizu Pay - Advanced Finance Technology",
  description: "A smart all-in-one solution for making seamless payments on any e-commerce site using cUSD or CELO on the Celo blockchain.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakartaSans.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
