'use client'

import { Box, styled } from '@mui/material'

type WaveBoxProps = {
  variant?: 'gold' | 'white'
}

const WaveBox = styled(Box)<WaveBoxProps>((props) => ({
  background: `url("/images/wave-${props.variant ?? 'white'}.png") repeat`,
}))

export default WaveBox
