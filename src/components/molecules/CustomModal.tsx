import { Theme } from '@emotion/react'
import {
  Box,
  IconButton,
  Modal,
  styled,
  SxProps,
  Typography,
} from '@mui/material'
import React, { ReactNode } from 'react'

import useModalState from '@/hooks/context/useModalState'

import { Modals } from '@/context/modal/modal.types'

import { CrossIcon } from '@/assets/icons'

const StyledModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20%',
  left: '50%',
  width: '40%',
  zIndex: 9999,
  borderRadius: 8,
  backgroundColor: 'white',
  padding: theme.spacing(2),
  boxShadow: theme.shadows[24],
  transform: 'translate(-50%, -50%)',
}))

interface CustomModalProps {
  modalKey: keyof Modals
  title?: string
  children?: ReactNode
  onClose?: () => void
  modalStyles?: SxProps<Theme>
}

const CustomModal: React.FC<CustomModalProps> = ({
  modalKey,
  title,
  children,
  onClose,
  modalStyles,
}) => {
  const { modal, closeModal } = useModalState()
  const isOpen = modal[modalKey].isOpen

  const onCloseModal = () => {
    closeModal(modalKey)
    onClose?.()
  }

  return (
    <Modal open={isOpen} onClose={onCloseModal}>
      <StyledModalBox sx={modalStyles}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='flex-start'
        >
          {title && (
            <Typography id='modal-title' variant='h6' component='h2'>
              {title}
            </Typography>
          )}
          <IconButton aria-label='close' onClick={() => closeModal(modalKey)}>
            <CrossIcon />
          </IconButton>
        </Box>

        <Box id='modal-content' sx={{ mt: 2 }}>
          {children}
        </Box>
      </StyledModalBox>
    </Modal>
  )
}

export default CustomModal
