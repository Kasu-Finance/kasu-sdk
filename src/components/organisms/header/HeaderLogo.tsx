'use client'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import KasuLogo from '@/assets/logo/Kasu'

const HeaderLogo = () => {
  const { isLiteMode } = useLiteModeState()

  return <KasuLogo color={isLiteMode ? 'white' : undefined} />
}

export default HeaderLogo
