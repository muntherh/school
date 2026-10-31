import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/use-auth'
import { Toaster } from '@/components/ui/toaster'


export const metadata: Metadata = {
  title: 'SDMS - School Disciplinary Management System',
  description: 'School Disciplinary Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
