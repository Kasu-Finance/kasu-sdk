import { Box, Button, Typography } from '@mui/material'
import React from 'react'

import { CrossIcon } from '@/assets/icons'

type ModalHeaderProps = {
  title: string
  onClose: () => void
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose }) => {
  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      py={1}
    >
      <Typography variant='h5' component='span'>
        {title}
      </Typography>
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

export default ModalHeader
