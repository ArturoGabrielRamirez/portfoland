// =============================================================================
// Next.js Configuration
// =============================================================================
// Configures Next.js with internationalization support via next-intl.
// =============================================================================

import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// =============================================================================
// next-intl Plugin
// =============================================================================

/**
 * Create the next-intl plugin with default request configuration path.
 * The plugin automatically looks for i18n/request.ts.
 */
const withNextIntl = createNextIntlPlugin()

// =============================================================================
// Next.js Config
// =============================================================================

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // Google OAuth images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      /*     {
            protocol: 'https',
            hostname: 'lh3.ggusercontent.com',
          }, */
      // GitHub OAuth images
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Vercel Blob storage
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // Generic CDNs (for manual URL input)
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
    ],
  }
}


export default withNextIntl(nextConfig)
