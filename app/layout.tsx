// =============================================================================
// Root Layout
// =============================================================================
// Minimal root layout that wraps the entire application.
// Locale-specific providers and content are handled in app/[locale]/layout.tsx.
// =============================================================================

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

// =============================================================================
// Font Configuration
// =============================================================================

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Portfoland',
  description: 'Gamified career storytelling platform',
}

// =============================================================================
// Root Layout
// =============================================================================

/**
 * Root layout component.
 *
 * Provides the HTML document structure and global styles.
 * The lang attribute is intentionally omitted here as it will be
 * set dynamically based on the locale in the [locale] layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
