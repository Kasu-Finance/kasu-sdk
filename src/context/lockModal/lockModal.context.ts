import { createContext } from 'react'

import {
  LockModalActions,
  LockModalStateType,
} from '@/context/lockModal/lockModal.types'

import { ContextWrapper } from '@/types/utils'

const lockModalContext = createContext(
  {} as ContextWrapper<LockModalStateType, LockModalActions>
)
lockModalContext.displayName = 'LockModalContext'

export default lockModalContext
