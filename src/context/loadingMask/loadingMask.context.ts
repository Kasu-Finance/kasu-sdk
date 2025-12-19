import { createContext } from 'react'

import { LoadingMaskTypes } from '@/context/loadingMask/loadingMask.types'

const loadingMaskContext = createContext({} as LoadingMaskTypes)
loadingMaskContext.displayName = 'LoadingMaskContext'

export default loadingMaskContext
