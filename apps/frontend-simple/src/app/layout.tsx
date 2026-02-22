import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Heat Demand Predictor',
  description: 'AI-powered heat demand prediction system for district heating',
}

import { DataProvider } from '@/providers/DataProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen relative flex flex-col bg-background text-foreground grid-pattern antialiased selection:bg-primary/20 selection:text-primary">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="flex-1 relative z-10">
            <DataProvider>
              {children}
            </DataProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
