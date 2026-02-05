'use client'

import { ReactNode, useEffect, useState } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'

type LiteModeRendererProps = {
  renderOnLiteMode: ReactNode
  otherwise: ReactNode
}

/**
 * Renders different content based on lite mode UI preference.
 * Shows `renderOnLiteMode` when user has enabled lite mode UI preference.
 *
 * NOTE: This is about UI view preference, NOT chain deployment type.
 * - Lite View = simplified UI (user preference)
 * - Lite Deployment = chain without KSU features (XDC, Plume)
 *
 * Users can use Pro View on Lite Deployments - the deployment type
 * only affects feature availability (KSU locking, loyalty, etc.),
 * not the UI view mode.
 *
 * Uses a mounted state to prevent hydration mismatch.
 */
const LiteModeRenderer: React.FC<LiteModeRendererProps> = ({
  otherwise,
  renderOnLiteMode,
}) => {
  const { isLiteMode } = useLiteModeState()
  const [hasMounted, setHasMounted] = useState(false)

  // Track client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Show lite content ONLY if user prefers lite mode (UI preference)
  // NOT based on chain deployment type
  const shouldShowLite = isLiteMode === true

  // Before mount, render based on isLiteMode to match server
  // This prevents hydration mismatch
  if (!hasMounted) {
    const serverShouldShowLite = isLiteMode === true
    return serverShouldShowLite ? renderOnLiteMode : otherwise
  }

  return shouldShowLite ? renderOnLiteMode : otherwise
}

export default LiteModeRenderer
