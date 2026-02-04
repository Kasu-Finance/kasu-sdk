import { useCallback } from 'react'

import { useChain } from '@/hooks/context/useChain'

/**
 * Hook for generating block explorer URLs for the current chain.
 *
 * Uses the chain context to get the correct explorer URL for Base, XDC, etc.
 *
 * @example
 * const { getTxUrl, getAddressUrl, getTokenUrl } = useExplorerUrl()
 *
 * // Generate transaction URL
 * <a href={getTxUrl(txHash)}>View Transaction</a>
 *
 * // Generate address URL
 * <a href={getAddressUrl(walletAddress)}>View Address</a>
 */
export const useExplorerUrl = () => {
  const { chainConfig } = useChain()
  const baseUrl = chainConfig.blockExplorer

  const getTxUrl = useCallback(
    (hash: string) => `${baseUrl}/tx/${hash}`,
    [baseUrl]
  )

  const getAddressUrl = useCallback(
    (address: string) => `${baseUrl}/address/${address}`,
    [baseUrl]
  )

  const getTokenUrl = useCallback(
    (address: string) => `${baseUrl}/token/${address}`,
    [baseUrl]
  )

  const getBlockUrl = useCallback(
    (blockNumber: string | number) => `${baseUrl}/block/${blockNumber}`,
    [baseUrl]
  )

  return {
    /** Base explorer URL (e.g., https://basescan.org or https://xdcscan.com) */
    baseUrl,
    /** Generate URL for a transaction hash */
    getTxUrl,
    /** Generate URL for an address */
    getAddressUrl,
    /** Generate URL for a token contract */
    getTokenUrl,
    /** Generate URL for a block number */
    getBlockUrl,
  }
}
