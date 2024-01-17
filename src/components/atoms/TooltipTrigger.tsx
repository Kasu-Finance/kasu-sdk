import { Box, styled } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

type TooltipTriggerProps = {
  children: ReactNode
}

const StyledBox = styled(Box)({
  cursor: 'help',
  ':hover > svg > path': {
    fill: '#42A5F5',
  },
  '& > svg > path ': {
    transition: 'fill 0.3s ease',
  },
})

const TooltipTrigger = forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, ...rest }, ref) => (
    <StyledBox display='flex' alignItems='center' {...rest} ref={ref}>
      {children}
    </StyledBox>
  )
)

export default TooltipTrigger
