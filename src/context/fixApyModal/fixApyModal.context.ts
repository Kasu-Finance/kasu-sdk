import { createContext } from 'react'

import { FixApyModalTypes } from '@/context/fixApyModal/fixApyModal.types'

const fixApyModalContext = createContext({} as FixApyModalTypes)
fixApyModalContext.displayName = 'FixApyModalContext'

export default fixApyModalContext
