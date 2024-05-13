import CloseIcon from '@mui/icons-material/Close'
import { Box, Button, DialogTitle, SxProps, Theme } from '@mui/material'
import { ReactNode } from 'react'

import BoxImgBackground from '@/components/atoms/BoxImgBackground'

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
    <BoxImgBackground
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
            sx={{
              p: 1.5,
              width: 48,
              height: 48,
              color: (theme) => theme.palette.primary.contrastText,
            }}
          >
            <CloseIcon />
          </Button>
        )}
      </Box>
    </BoxImgBackground>
  )
}

export default DialogHeader
