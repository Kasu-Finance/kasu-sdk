import { Box, BoxProps } from '@mui/material'
import { ReactNode } from 'react'

import WaveBox from '@/components/atoms/WaveBox'

type DialogContentProps = BoxProps & {
  children?: ReactNode
  innerBoxProps?: BoxProps
}

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  innerBoxProps,
  ...rest
}) => (
  <WaveBox variant='gold' px={2} py={3} borderRadius={2} {...rest}>
    <Box
      {...innerBoxProps}
      sx={[
        {
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 2,
            backgroundColor: 'gray.extraDark',
          },
        },
        ...(Array.isArray(innerBoxProps?.sx)
          ? innerBoxProps.sx
          : [innerBoxProps?.sx]),
      ]}
    >
      {children}
    </Box>
  </WaveBox>
)

export default DialogContent
