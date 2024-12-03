/** @type {import('next').NextConfig} */

// eslint-disable-next-line
const path = require('path')

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kasu-uat.vercel.app',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'kasu.finance',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'kasu-finance.directus.app',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'kasu-dev.directus.app',
        pathname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/lending',
        permanent: true,
      },
    ]
  },

  experimental: {
    serverComponentsHmrCache: false,
    optimizePackageImports: ['dayjs', 'ethers'],
  },
  // needed for turbo dev mode for locally linked packages
  ...(process.env.NODE_ENV === 'development'
    ? {
        outputFileTracingRoot: path.join(__dirname, '../../'),
      }
    : {}),
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://app.safe.global',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, content-type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
