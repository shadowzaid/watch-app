import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { WatchlistProvider } from '@/contexts/WatchlistContext'
import { ProgressProvider } from '@/contexts/ProgressContext'

export const metadata: Metadata = {
  title: 'Watch — Stream Movies & TV',
  description: 'Your personal Netflix-style streaming platform.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WatchlistProvider>
            <ProgressProvider>
              {children}
            </ProgressProvider>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
