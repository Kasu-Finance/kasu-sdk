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
  onAction?: () => void
  modalStyles?: SxProps<Theme>
  actionIcon?: ReactNode
  hideActionIcon?: boolean
}

const CustomModal: React.FC<CustomModalProps> = ({
  modalKey,
  title,
  children,
  onAction,
  modalStyles,
  actionIcon,
  hideActionIcon,
}) => {
  const { modal, closeModal } = useModalState()
  const isOpen = modal[modalKey].isOpen

  const onActionModal = () => {
    closeModal(modalKey)
    onAction?.()
  }

  return (
    <Modal open={isOpen} onClose={onActionModal}>
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
          {!hideActionIcon &&
            (actionIcon || (
              <IconButton aria-label='action' onClick={onActionModal}>
                <CrossIcon />
              </IconButton>
            ))}
        </Box>
        <Box sx={{ mt: 2 }}>{children}</Box>
      </StyledModalBox>
    </Modal>
  )
}

export default CustomModal
