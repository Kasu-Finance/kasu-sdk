import {
  Card,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material'
import Image from 'next/image'
import React from 'react'

import Cat from '@/assets/cat.png'

interface EmptyCardStateProps extends Partial<TypographyProps> {
  message: string
  sx?: SxProps<Theme>
}

const EmptyCardState: React.FC<EmptyCardStateProps> = (props) => {
  const { message, sx, variant = 'h6', color = 'white' } = props

  const combinedSx: SxProps<Theme> = {
    width: '100%',
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    mt: 3,
    bgcolor: 'transparent',
  }

  return (
    <Card sx={[combinedSx, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Image src={Cat} alt='Cat' />
      <Typography variant={variant} color={color} mt={2}>
        {message}
      </Typography>
    </Card>
  )
}

export default EmptyCardState
