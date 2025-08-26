// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
    // We do NOT enable dangerouslyAllowSVG.
    // We'll request PNGs instead (safer and supported by Next/Image).
  },
}

export default nextConfig
