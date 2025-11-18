import { createContext } from 'react'

import { UnlockModalTypes } from '@/context/unlockModal/unlockModal.types'

const unlockModalContext = createContext({} as UnlockModalTypes)
unlockModalContext.displayName = 'UnlockModalContext'

export default unlockModalContext
