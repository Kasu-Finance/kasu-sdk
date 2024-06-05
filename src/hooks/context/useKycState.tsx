import { useContext } from 'react'

import kycContext from '@/context/kyc/kyc.context'
import { KycTypes } from '@/context/kyc/kyc.types'

const useKycState = (): KycTypes => {
  const context = useContext(kycContext)

  if (!Object.keys(context).length) {
    throw new Error('KycContext must be used within its provider')
  }

  return context
}

export default useKycState
