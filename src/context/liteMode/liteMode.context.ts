import { createContext } from 'react'

import { LiteModeTypes } from '@/context/liteMode/liteMode.types'

const liteModeContext = createContext({} as LiteModeTypes)
liteModeContext.displayName = 'LiteModeContext'

export default liteModeContext
