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
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob:;
              font-src 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              child-src 'self' https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;
              frame-src 'self' https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com;
              connect-src 'self' https://auth.privy.io https://kasu-dev.directus.app https://kasu-finance.directus.app wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems https://explorer-api.walletconnect.com;
              worker-src 'self';
              manifest-src 'self';
            `
              .replace(/\s{2,}/g, ' ')
              .trim(),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
