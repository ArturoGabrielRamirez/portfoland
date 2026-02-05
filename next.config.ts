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
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  }
}


export default withNextIntl(nextConfig)
