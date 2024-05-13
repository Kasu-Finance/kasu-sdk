import { Box, styled } from '@mui/material'
import { ReactNode, forwardRef } from 'react'

type TooltipTriggerProps = {
  children: ReactNode
}

const StyledBox = styled(Box)(({ theme }) => ({
  cursor: 'help',
  ':hover > svg > path': {
    fill: theme.palette.primary.dark,
  },
  '& > svg > path ': {
    transition: 'fill 0.3s ease',
  },
}))

const TooltipTrigger = forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, ...rest }, ref) => (
    <StyledBox ml={0.5} display='flex' alignItems='center' {...rest} ref={ref}>
      {children}
    </StyledBox>
  )
)

export default TooltipTrigger
