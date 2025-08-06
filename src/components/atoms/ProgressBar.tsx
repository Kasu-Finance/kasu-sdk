import { Box, lighten, styled, SxProps, Theme } from '@mui/material'
import { ReactNode } from 'react'

const ProgressBarRoot = styled(Box)({
  position: 'relative',
  display: 'block',
  height: '4px',
  overflow: 'hidden',
})

const ProgressBarBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: lighten(theme.palette.primary.main, 0.62),
  color: theme.palette.text.disabled,
  transition: 'clip-path 1s linear',
  zIndex: 1,
}))

const ProgressBarForeground = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'value',
})<ProgressBarBackgroundProp>(({ theme, value }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  zIndex: 2,
  position: 'relative',
  width: `${value}%`,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}))

type ProgressBarBackgroundProp = {
  value: number
}

type ProgressBarProps = {
  value: number
  children?: ReactNode
  rootStyles?: SxProps<Theme>
  barStyles?: SxProps<Theme>
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  children,
  rootStyles,
  barStyles,
  value,
}) => {
  return (
    <ProgressBarRoot sx={rootStyles}>
      <ProgressBarForeground
        value={value}
        className='progress-foreground'
        sx={barStyles}
      >
        {children}
      </ProgressBarForeground>
      <ProgressBarBackground className='progress-background' sx={barStyles}>
        {children}
      </ProgressBarBackground>
    </ProgressBarRoot>
  )
}

export default ProgressBar
