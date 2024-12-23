import { Inter } from 'next/font/google'
// import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Project Management Tool',
  description: 'A modern project management tool built with Next.js and React',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          {/* <Toaster /> */}
        </AuthProvider>
      </body>
    </html>
  )
}

