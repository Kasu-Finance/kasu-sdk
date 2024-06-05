import { createContext } from 'react'

import { LockModalTypes } from '@/context/lockModal/lockModal.types'

const lockModalContext = createContext({} as LockModalTypes)
lockModalContext.displayName = 'LockModalContext'

export default lockModalContext
