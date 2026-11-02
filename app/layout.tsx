import type { Metadata } from 'next'
import './globals.css'
import { school } from '@/lib/school'
import { AuthProvider } from '@/hooks/use-auth'
import { Toaster } from '@/components/ui/toaster'


export const metadata: Metadata = {
  title: `${school.portalName} | ${school.nameShortEn}`,
  description: `School Disciplinary Management System of ${school.nameEn}`,
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
