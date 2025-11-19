'use client'

import { ReactNode } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'

type LiteModeRendererProps = {
  renderOnLiteMode: ReactNode
  otherwise: ReactNode
}

const LiteModeRenderer: React.FC<LiteModeRendererProps> = ({
  otherwise,
  renderOnLiteMode,
}) => {
  const { isLiteMode } = useLiteModeState()

  return isLiteMode ? renderOnLiteMode : otherwise
}

export default LiteModeRenderer
