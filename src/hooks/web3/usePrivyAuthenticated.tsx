import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

const usePrivyAuthenticated = () => {
  const { address } = useAccount()
  const { ready, authenticated } = usePrivy()
  const isAuthenticated = Boolean(ready && authenticated && address)

  return { isAuthenticated, address: isAuthenticated ? address : undefined }
}

export default usePrivyAuthenticated
