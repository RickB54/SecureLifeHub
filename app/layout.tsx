import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Secure Life Hub',
  description: 'Manage your entire digital and physical life securely.',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Secure Life Hub',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

import AuthProvider from "@/components/auth-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
