import { createContext } from 'react'

import { KycActions, KycStateType } from '@/context/kyc/kyc.types'

import { ContextWrapper } from '@/types/utils'

const kycContext = createContext({} as ContextWrapper<KycStateType, KycActions>)
kycContext.displayName = 'KycContext'

export default kycContext
