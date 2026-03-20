import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AntiDebugProvider } from '@/components/anti-debug-provider'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Remote WEB - IP',
  description: 'Advanced gaming enhancement suite with undetected features',
  keywords: 'gaming, enhancement, remote, pink, premium',
  authors: [{ name: 'Pink Remote Team' }],
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <AntiDebugProvider>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-900">
            {children}
          </div>
        </AntiDebugProvider>
      </body>
    </html>
  )
}