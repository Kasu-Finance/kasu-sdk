import { createContext } from 'react'

import {
  WithdrawModalActions,
  WithdrawModalStateType,
} from '@/context/withdrawModal/withdrawModal.types'

import { ContextWrapper } from '@/types/utils'

const WithdrawModalContext = createContext(
  {} as ContextWrapper<WithdrawModalStateType, WithdrawModalActions>
)
WithdrawModalContext.displayName = 'WithdrawModalContext'

export default WithdrawModalContext
