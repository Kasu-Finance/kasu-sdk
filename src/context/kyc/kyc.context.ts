import { createContext } from 'react'

import { KycTypes } from '@/context/kyc/kyc.types'

const kycContext = createContext({} as KycTypes)
kycContext.displayName = 'KycContext'

export default kycContext
