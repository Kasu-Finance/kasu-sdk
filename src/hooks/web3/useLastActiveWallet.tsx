import { ConnectedWallet } from '@privy-io/react-auth'
import { useCallback } from 'react'

const LAST_ACTIVE_WALLET_KEY = 'kasu_lastActiveWallet'

const useLastActiveWallet = () => {
  const getLastActiveWallet = useCallback(() => {
    const lastActiveWallet = localStorage.getItem(LAST_ACTIVE_WALLET_KEY)

    return lastActiveWallet
      ? (JSON.parse(lastActiveWallet) as ConnectedWallet)
      : null
  }, [])

  const setLastActiveWallet = useCallback((wallet: ConnectedWallet) => {
    localStorage.setItem(LAST_ACTIVE_WALLET_KEY, JSON.stringify(wallet))
  }, [])

  const removeLastActiveWallet = useCallback(
    () => localStorage.removeItem(LAST_ACTIVE_WALLET_KEY),
    []
  )

  return {
    getLastActiveWallet,
    setLastActiveWallet,
    removeLastActiveWallet,
  }
}

export default useLastActiveWallet
