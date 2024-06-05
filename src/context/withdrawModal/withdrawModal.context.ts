import { createContext } from 'react'

import { WithdrawModalTypes } from '@/context/withdrawModal/withdrawModal.types'

const WithdrawModalContext = createContext({} as WithdrawModalTypes)
WithdrawModalContext.displayName = 'WithdrawModalContext'

export default WithdrawModalContext
