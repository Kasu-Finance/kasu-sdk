import { createContext } from 'react'

import {
  DepositModalActions,
  DepositModalStateType,
} from '@/context/depositModal/depositModal.types'

import { ContextWrapper } from '@/types/utils'

const depositModalContext = createContext(
  {} as ContextWrapper<DepositModalStateType, DepositModalActions>
)
depositModalContext.displayName = 'DepositModalContext'

export default depositModalContext
