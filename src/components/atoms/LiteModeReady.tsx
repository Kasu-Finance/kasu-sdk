'use client'

import { PropsWithChildren } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'

const LiteModeReady: React.FC<PropsWithChildren> = ({ children }) => {
  const { isLiteMode } = useLiteModeState()

  if (typeof isLiteMode === 'undefined') {
    return null
  }

  return children
}

export default LiteModeReady
