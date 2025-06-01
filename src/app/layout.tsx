import './globals.css'
import type { Metadata } from 'next'
import { Example } from '@/components/sidebar'

export const metadata: Metadata = {
  title: 'Presupuestos Next',
  description: 'Sistema de gestión de presupuestos',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <Example>{children}</Example>
      </body>
    </html>
  )
}
