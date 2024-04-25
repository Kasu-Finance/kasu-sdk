import { Box, Button, DialogTitle, SxProps, Theme } from '@mui/material'
import React, { ReactNode } from 'react'

import { CrossIcon } from '@/assets/icons'

type DialogHeaderProps = {
  title: string
  children?: ReactNode
  showClose?: boolean
  containerSx?: SxProps<Theme>
  onClose: () => void
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  children,
  showClose = true,
  containerSx,
  onClose,
}) => {
  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      px={2}
      py={1}
      sx={containerSx}
    >
      <DialogTitle sx={{ p: 0 }} variant='h5' component='span'>
        {title}
      </DialogTitle>
      <Box>
        {children}
        {showClose && (
          <Button
            variant='text'
            onClick={onClose}
            sx={{ p: 1.5, width: 48, height: 48 }}
          >
            <CrossIcon />
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default DialogHeader
