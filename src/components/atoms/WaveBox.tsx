'use client'

import { Box, styled } from '@mui/material'

type WaveBoxProps = {
  variant?: 'gold' | 'white' | 'gray' | 'dark-gray' | 'dark-gold'
  backgroundColor?: string
}

const WaveBox = styled(Box)<WaveBoxProps>((props) => ({
  background: `url("/images/wave-${props.variant ?? 'white'}.png") repeat, ${props.backgroundColor ?? 'white'}`,
}))

export default WaveBox
