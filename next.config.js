/** @type {import('next').NextConfig} */

// eslint-disable-next-line
const path = require('path')

const nextConfig = {
  distDir: 'build',
  images: {
    domains: [
      'example2.com', // TODO: Remove 'example2.com' and add the real URL domain here when the backend is ready.
      'kasu.finance',
      '',
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
    optimizePackageImports: ['dayjs', 'ethers'],
    // needed for turbo dev mode for locally linked packages
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: false,
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
