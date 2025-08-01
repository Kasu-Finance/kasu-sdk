import { useContext } from 'react'

import sdkContext from '@/context/sdk/sdk.context'

const useSdk = () => {
  const context = useContext(sdkContext)

  if (!Object.keys(context).length) {
    throw new Error('SdkContext must be used within its provider')
  }

  return context.sdk
}

export default useSdk
