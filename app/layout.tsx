import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Secure Life Hub',
  description: 'Manage your entire digital and physical life securely.',
  generator: 'v0.dev',
}

import AuthProvider from "@/components/auth-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
