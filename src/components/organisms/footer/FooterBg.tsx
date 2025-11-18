'use client'

import { Box } from '@mui/material'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import FooterDarkBg from '@/images/footer-background.png'
import FooterWhiteBg from '@/images/footer-background-white.png'

const FooterBg = () => {
  const { isLiteMode } = useLiteModeState()

  return (
    <Box
      component='img'
      src={isLiteMode ? FooterWhiteBg.src : FooterDarkBg.src}
      alt='footer background'
      style={{
        position: 'absolute',
        zIndex: -1,
        bottom: 0,
        right: 0,
        width: '100%',
        height: 418,
      }}
    />
  )
}

export default FooterBg
