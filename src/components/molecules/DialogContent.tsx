import { BoxProps } from '@mui/material'
import { ReactNode } from 'react'

import WaveBox from '@/components/atoms/WaveBox'

type DialogContentProps = BoxProps & {
  children?: ReactNode
}

const DialogContent: React.FC<DialogContentProps> = ({ children, ...rest }) => (
  <WaveBox variant='gold' px={2} py={3} borderRadius={2} {...rest}>
    {children}
  </WaveBox>
)

export default DialogContent
