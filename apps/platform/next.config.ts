import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Turborepo configuration - tell Next.js where the monorepo root is
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // Allow loading images from MinistryPlatform
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'my.mcleanbible.org',
        pathname: '/ministryplatformapi/files/**',
      },
    ],
  },

  // PWA configuration for app-like experience
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
