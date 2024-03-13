import {
  Card,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material'
import React from 'react'

interface EmptyCardStateProps extends Partial<TypographyProps> {
  message: string
  sx?: SxProps<Theme>
}

const EmptyCardState: React.FC<EmptyCardStateProps> = (props) => {
  const { message, sx, variant = 'h6', color = 'text.secondary' } = props

  const combinedSx: SxProps<Theme> = {
    width: '100%',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 2,
    ...sx,
  }

  return (
    <Card sx={combinedSx}>
      <Typography variant={variant} color={color}>
        {message}
      </Typography>
    </Card>
  )
}

export default EmptyCardState
