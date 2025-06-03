import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

const usePrivyAuthenticated = () => {
  const { address } = useAccount()

  const { ready, authenticated } = usePrivy()

  return { isAuthenticated: ready && authenticated && address }
}

export default usePrivyAuthenticated
