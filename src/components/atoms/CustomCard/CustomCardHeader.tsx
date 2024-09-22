import { Box, BoxProps, Typography, TypographyProps } from '@mui/material'
import React, { ReactNode } from 'react'

type CustomCardHeaderProps = BoxProps & {
  title: string
  titleProps?: TypographyProps
  children?: ReactNode
}

const CustomCardHeader: React.FC<CustomCardHeaderProps> = ({
  title,
  children,
  ...rest
}) => {
  return (
    <Box display='flex' alignItems='center' height={80} {...rest} px={2}>
      <Typography variant='h3' color='gold.darkNoises'>
        {title}
      </Typography>
      {children}
    </Box>
  )
}

export default CustomCardHeader
