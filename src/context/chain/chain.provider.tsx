'use client'

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAccount, useSwitchChain } from 'wagmi'

import {
  DEFAULT_CHAIN_ID,
  getChainConfig,
  isChainSupported,
  SUPPORTED_CHAINS,
} from '@/config/chains'

import { ChainContext, ChainContextValue } from './chain.context'

const CHAIN_STORAGE_KEY = 'kasu-selected-chain'

/**
 * Provider for chain state management.
 * Syncs with wallet chain and persists selection to localStorage.
 */
export const ChainProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { chain: walletChain } = useAccount()
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain()

  // Initialize from localStorage or wallet chain or default
  const [currentChainId, setCurrentChainId] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CHAIN_STORAGE_KEY)
      if (stored && isChainSupported(Number(stored))) {
        return Number(stored)
      }
    }
    return DEFAULT_CHAIN_ID
  })

  // Sync with wallet chain when it changes to a supported chain
  useEffect(() => {
    if (walletChain && isChainSupported(walletChain.id)) {
      setCurrentChainId(walletChain.id)
      if (typeof window !== 'undefined') {
        localStorage.setItem(CHAIN_STORAGE_KEY, String(walletChain.id))
      }
    }
  }, [walletChain])

  const chainConfig = useMemo(
    () => getChainConfig(currentChainId) || SUPPORTED_CHAINS[DEFAULT_CHAIN_ID],
    [currentChainId]
  )

  const switchChain = useCallback(
    async (chainId: number) => {
      if (!isChainSupported(chainId)) {
        throw new Error(`Chain ${chainId} is not supported`)
      }

      // Switch wallet chain if connected
      if (switchChainAsync && walletChain) {
        try {
          await switchChainAsync({ chainId })
        } catch (error) {
          // User might reject the switch, but we still update the app state
          console.warn('Wallet chain switch failed:', error)
        }
      }

      // Update state and persist
      setCurrentChainId(chainId)
      if (typeof window !== 'undefined') {
        localStorage.setItem(CHAIN_STORAGE_KEY, String(chainId))
      }
    },
    [switchChainAsync, walletChain]
  )

  const value: ChainContextValue = useMemo(
    () => ({
      currentChainId,
      chainConfig,
      isLiteDeployment: chainConfig.isLiteDeployment,
      hasKsuToken: !chainConfig.isLiteDeployment,
      hasLocking: !chainConfig.isLiteDeployment,
      hasLoyalty: !chainConfig.isLiteDeployment,
      hasNfts: !chainConfig.isLiteDeployment,
      switchChain,
      isSwitchingChain,
      supportedChains: Object.values(SUPPORTED_CHAINS),
    }),
    [currentChainId, chainConfig, switchChain, isSwitchingChain]
  )

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>
}
