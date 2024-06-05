import { createContext } from 'react'

import { DepositModalTypes } from '@/context/depositModal/depositModal.types'

const depositModalContext = createContext({} as DepositModalTypes)
depositModalContext.displayName = 'DepositModalContext'

export default depositModalContext
