import { useContext } from 'react'

import liteModeContext from '@/context/liteMode/liteMode.context'
import { LiteModeTypes } from '@/context/liteMode/liteMode.types'

const useLiteModeState = (): LiteModeTypes => {
  const context = useContext(liteModeContext)

  if (!context) {
    throw new Error('LiteModeContext must be used within its provider')
  }

  return context
}

export default useLiteModeState
