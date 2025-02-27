import { Box, BoxProps, Typography, TypographyProps } from '@mui/material'
import React, { ReactNode } from 'react'

type CustomCardHeaderProps = Omit<BoxProps, 'title'> & {
  title: ReactNode
  titleProps?: TypographyProps
  children?: ReactNode
}

const CustomCardHeader: React.FC<CustomCardHeaderProps> = ({
  title,
  titleProps,
  children,
  ...rest
}) => {
  return (
    <Box display='flex' alignItems='center' height={80} {...rest} px={2}>
      <Typography
        variant='h3'
        color='gold.darkNoises'
        textTransform='capitalize'
        {...titleProps}
      >
        {title}
      </Typography>
      {children}
    </Box>
  )
}

export default CustomCardHeader
