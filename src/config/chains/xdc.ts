import { defineChain } from 'viem'

export const xdc = defineChain({
  id: 50,
  name: 'XDC Network',
  nativeCurrency: {
    decimals: 18,
    name: 'XDC',
    symbol: 'XDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.xdc.org'] },
  },
  blockExplorers: {
    default: { name: 'XDCScan', url: 'https://xdcscan.com' },
  },
  contracts: {},
})
