import type { ContractAddresses } from '@kasufinance/kasu-sdk/src/sdk-config'
import { Chain } from 'viem'
import { base } from 'viem/chains'

import { xdc } from './xdc'
import baseAddresses from '../sdk/addresses-base-mainnet.json'
import xdcAddresses from '../sdk/addresses-xdc.json'

/**
 * Chain-specific configuration for the Kasu protocol.
 */
export interface ChainConfig {
  /** viem chain definition */
  chain: Chain
  /** Chain ID */
  chainId: number
  /** Display name */
  name: string
  /** Whether this is a Lite deployment (no KSU token) */
  isLiteDeployment: boolean
  /** Contract addresses for this chain */
  contracts: ContractAddresses
  /** Subgraph URL for this chain */
  subgraphUrl: string
  /** USDC token address */
  usdc: string
  /** Block explorer URL */
  blockExplorer: string
  /** RPC URLs (primary first) */
  rpcUrls: string[]
}

/**
 * Registry of all supported chains.
 */
export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  [base.id]: {
    chain: base,
    chainId: base.id,
    name: 'Base',
    isLiteDeployment: false,
    contracts: {
      KSUToken: baseAddresses.KSU.address,
      IKSULocking: baseAddresses.KSULocking.address,
      IKSULockBonus: baseAddresses.KSULockBonus.address,
      LendingPoolManager: baseAddresses.LendingPoolManager.address,
      UserManager: baseAddresses.UserManager.address,
      KasuAllowList: baseAddresses.KasuAllowList.address,
      SystemVariables: baseAddresses.SystemVariables.address,
      KsuPrice: baseAddresses.KsuPrice.address,
      UserLoyaltyRewards: baseAddresses.UserLoyaltyRewards.address,
      ClearingCoordinator: baseAddresses.ClearingCoordinator.address,
      KasuNFTs: baseAddresses.KasuNFTs.address,
      ExternalTVL: baseAddresses.ExternalTVL.address,
    },
    subgraphUrl:
      'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-base/v1.0.13/gn',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    blockExplorer: 'https://basescan.org',
    rpcUrls: ['https://base-rpc.publicnode.com', 'https://mainnet.base.org'],
  },
  [xdc.id]: {
    chain: xdc,
    chainId: xdc.id,
    name: 'XDC',
    isLiteDeployment: true,
    contracts: {
      // No KSUToken on Lite deployments
      IKSULocking: xdcAddresses.KSULocking.address,
      IKSULockBonus: xdcAddresses.KSULockBonus.address,
      LendingPoolManager: xdcAddresses.LendingPoolManager.address,
      UserManager: xdcAddresses.UserManager.address,
      KasuAllowList: xdcAddresses.KasuAllowList.address,
      SystemVariables: xdcAddresses.SystemVariables.address,
      KsuPrice: xdcAddresses.KsuPrice.address,
      UserLoyaltyRewards: xdcAddresses.UserLoyaltyRewards.address,
      ClearingCoordinator: xdcAddresses.ClearingCoordinator.address,
      // No KasuNFTs on Lite deployments
      ExternalTVL: xdcAddresses.KasuPoolExternalTVL.address,
    },
    subgraphUrl:
      'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc/v1.0.0/gn',
    usdc: '0xfa2958cb79b0491cc627c1557f441ef849ca8eb1',
    blockExplorer: 'https://xdcscan.com',
    rpcUrls: ['https://rpc.xdc.org', 'https://erpc.xdc.org'],
  },
}

/**
 * Default chain to use when no chain is selected or persisted.
 */
export const DEFAULT_CHAIN_ID = base.id

/**
 * List of supported chain IDs.
 */
export const SUPPORTED_CHAIN_IDS = Object.keys(SUPPORTED_CHAINS).map(Number)

/**
 * Get chain configuration by chain ID.
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS[chainId]
}

/**
 * Check if a chain ID is supported.
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in SUPPORTED_CHAINS
}

/**
 * Get all chain definitions for wallet configuration.
 */
export function getAllChains(): Chain[] {
  return Object.values(SUPPORTED_CHAINS).map((c) => c.chain)
}
