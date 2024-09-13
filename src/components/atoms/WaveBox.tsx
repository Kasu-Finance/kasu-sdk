'use client'

import { Box, styled } from '@mui/material'

type WaveBoxProps = {
  variant?: 'gold' | 'white' | 'gray'
}

const WaveBox = styled(Box)<WaveBoxProps>((props) => ({
  background: `url("/images/wave-${props.variant ?? 'white'}.png") repeat, white`,
}))

export default WaveBox
