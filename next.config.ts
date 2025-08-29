// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { 
        protocol: 'https', 
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'socialmediaapp-rho.vercel.app',
        port: '',
        pathname: '/**'
      }
    ],
  },
}

export default nextConfig