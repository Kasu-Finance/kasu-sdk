'use client'

import { ReactNode } from 'react'

import { useChain } from '@/hooks/context/useChain'
import useLiteModeState from '@/hooks/context/useLiteModeState'

type LiteModeRendererProps = {
  renderOnLiteMode: ReactNode
  otherwise: ReactNode
}

/**
 * Renders different content based on lite mode status.
 * Shows `renderOnLiteMode` when:
 * - User has enabled lite mode UI preference, OR
 * - Current chain is a Lite deployment (no KSU token features)
 */
const LiteModeRenderer: React.FC<LiteModeRendererProps> = ({
  otherwise,
  renderOnLiteMode,
}) => {
  const { isLiteMode } = useLiteModeState()
  const { isLiteDeployment } = useChain()

  // Show lite content if user prefers lite mode OR chain is a Lite deployment
  const shouldShowLite = isLiteMode || isLiteDeployment

  return shouldShowLite ? renderOnLiteMode : otherwise
}

export default LiteModeRenderer
