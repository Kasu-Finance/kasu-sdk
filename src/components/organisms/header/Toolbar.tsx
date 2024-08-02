'use client'

import {
  Toolbar as MuiToolbar,
  ToolbarProps as MuiToolbarProps,
} from '@mui/material'
import { ReactNode } from 'react'

type ToolbarProps = MuiToolbarProps & {
  children: ReactNode
}

const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
  return (
    <MuiToolbar
      disableGutters
      sx={(theme) => ({
        height: 84,
        [theme.breakpoints.down('sm')]: {
          height: 74,

          '#kasu-logo': {
            height: 42,
          },
        },
      })}
    >
      {children}
    </MuiToolbar>
  )
}

export default Toolbar
