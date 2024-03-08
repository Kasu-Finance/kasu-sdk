import { Box, lighten, styled } from '@mui/material'
import React, { ReactNode } from 'react'

const ProgressBarRoot = styled(Box)({
  position: 'relative',
  display: 'block',
  height: '4px',
  overflow: 'hidden',
})

const ProgressBarBackground = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'value',
})<ProgressBarBackgroundProp>(({ theme, value }) => ({
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
  clipPath: `inset(0 -1px -1px ${value}%)`,
  transition: 'clip-path 1s linear',
}))

const ProgressBarForeground = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
}))

type ProgressBarBackgroundProp = {
  value: number
}

type ProgressBarProps = {
  value: number
  children?: ReactNode
  rootStyles?: React.CSSProperties
  barStyles?: React.CSSProperties
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  children,
  rootStyles,
  barStyles,
  value,
}) => {
  return (
    <ProgressBarRoot sx={rootStyles}>
      <ProgressBarForeground sx={barStyles}>{children}</ProgressBarForeground>
      <ProgressBarBackground value={value} sx={barStyles}>
        {children}
      </ProgressBarBackground>
    </ProgressBarRoot>
  )
}

export default ProgressBar
