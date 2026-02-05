import { useContext } from 'react'

import sdkContext from '@/context/sdk/sdk.context'

/**
 * Hook to access the SDK instance.
 * Returns just the SDK for backward compatibility.
 */
const useSdk = () => {
  const context = useContext(sdkContext)

  if (!context) {
    throw new Error('SdkContext must be used within its provider')
  }

  return context.sdk
}

/**
 * Hook to access the full SDK context including chain transition state.
 */
export const useSdkState = () => {
  const context = useContext(sdkContext)

  if (!context) {
    throw new Error('SdkContext must be used within its provider')
  }

  return context
}

export default useSdk
