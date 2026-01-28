import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Portfoland - Transforma tu CV en una Aventura',
  description: 'Crea portfolios interactivos con timelines gamificados, arboles de habilidades y tu propio subdominio. Destaca ante recruiters con una experiencia unica.',
  keywords: ['portfolio', 'cv', 'gamificacion', 'timeline', 'habilidades', 'carrera profesional'],
  authors: [{ name: 'Portfoland' }],
  openGraph: {
    title: 'Portfoland - Tu Carrera, Tu Aventura',
    description: 'Transforma tu CV en una experiencia gamificada unica',
    type: 'website',
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#0a0e14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
