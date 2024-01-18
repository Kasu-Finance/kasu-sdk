import { Box, Button, DialogTitle } from '@mui/material'
import React from 'react'

import { CrossIcon } from '@/assets/icons'

type DialogHeaderProps = {
  title: string
  onClose: () => void
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ title, onClose }) => {
  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      py={1}
      px={3}
    >
      <DialogTitle sx={{ p: 0 }} variant='h5' component='span'>
        {title}
      </DialogTitle>
      <Button
        variant='text'
        onClick={onClose}
        sx={{ p: 1.5, width: 48, height: 48 }}
      >
        <CrossIcon />
      </Button>
    </Box>
  )
}

export default DialogHeader
