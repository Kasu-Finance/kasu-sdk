import {
  Card,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material'
import React from 'react'

interface EmptyStateProps extends Partial<TypographyProps> {
  message: string
  sx?: SxProps<Theme>
  typographyColor?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  sx,
  variant = 'h6',
  color = 'grey.400',
}) => {
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

export default EmptyState
