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
      {
        protocol: 'https',
        hostname: 'bafybei*.ipfs.w3s.link',
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
    const trustedDomains = [
      'https://challenges.cloudflare.com/',
      'https://app.pluno.ai/',
      'https://fonts.googleapis.com/',
      'https://fonts.gstatic.com/',
      'https://verify.walletconnect.com/',
      'https://verify.walletconnect.org/',
      'https://pulse.walletconnect.org/',
      'https://api.web3modal.org/',
      'https://auth.privy.io/',
      'https://kasu-dev.directus.app/',
      'https://kasu-finance.directus.app/',
      'https://*.coinbase.com/',
      'https://*.google.com/',
      'https://*.apple.com/',
      'https://*.ipfs.io/',
      '*.googletagmanager.com/',
      '*.google-analytics.com/',
      'wss://relay.walletconnect.com',
      'wss://relay.walletconnect.org',
      'wss://www.walletlink.org',
      'https://*.rpc.privy.systems/',
      'https://explorer-api.walletconnect.com/',
      'https://*.base.org/',
      'https://base-rpc.publicnode.com/',
      'https://subgraph.satsuma-prod.com/3ed46ea711d3/kasu-finance--314476/kasu-sepolia/api',
      'https://subgraph.satsuma-prod.com/3ed46ea711d3/kasu-finance--314476/kasu-base/api',
      'https://infragrid.v.network/',
      'https://identity-v2.compilot.ai/',
      'https://auth.privy.io/api/',
      'https://identity-api.compilot.ai/',
      'https://api.compilot.ai/identity/',
      'https://a.markfi.xyz/',
      'https://api.relay.link/',
      'https://api.testnets.relay.link/',
    ].filter(Boolean)

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
              script-src 'self' 'unsafe-inline' 'unsafe-eval' ${trustedDomains.join(' ')};
              style-src 'self' 'unsafe-inline' ${trustedDomains.join(' ')};
              img-src 'self' data: blob: https: ${trustedDomains.join(' ')};
              font-src 'self' ${trustedDomains.join(' ')};
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              child-src 'self' ${trustedDomains.join(' ')};
              frame-src 'self' ${trustedDomains.join(' ')};
              connect-src 'self' ${trustedDomains.join(' ')};
              worker-src 'self';
              manifest-src 'self';
              script-src-elem 'self' 'unsafe-inline' https://app.pluno.ai/ https://cdn.markfi.xyz/;
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
