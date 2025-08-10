import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Enlighten - Share Your Epiphanies',
  description: 'A platform for sharing moments of enlightenment and epiphany with the world.',
  keywords: ['enlightenment', 'epiphany', 'wisdom', 'insights', 'social'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-enlightenment-50 via-white to-primary-50">
          {children}
        </div>
      </body>
    </html>
  )
}
