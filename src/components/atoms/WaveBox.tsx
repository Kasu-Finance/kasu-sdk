'use client'

import { Box, styled } from '@mui/material'

export type WaveBoxProps = {
  variant?:
    | 'gold'
    | 'white'
    | 'gray'
    | 'dark-gray'
    | 'dark-gold'
    | 'dark-middle'
  backgroundColor?: string
}

const WaveBox = styled(Box)<WaveBoxProps>((props) => ({
  background: `url("/images/wave-${props.variant ?? 'white'}.png") repeat, ${props.backgroundColor ?? 'white'}`,
  backgroundSize: '17px 16px',
}))

export default WaveBox
