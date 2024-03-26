import { Theme } from '@emotion/react'
import { Box, IconButton, Modal, SxProps, Typography } from '@mui/material'
import React, { ReactNode } from 'react'

import useModalState from '@/hooks/context/useModalState'

import ModalBody from '@/components/atoms/ModalBody'

import { Modals } from '@/context/modal/modal.types'

import { CrossIcon } from '@/assets/icons'

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
      <ModalBody sx={modalStyles}>
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
      </ModalBody>
    </Modal>
  )
}

export default CustomModal
