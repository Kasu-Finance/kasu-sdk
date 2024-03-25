import { Theme } from '@emotion/react'
import {
  Box,
  LinearProgress,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import CustomModal from '@/components/molecules/CustomModal'

import { ModalsKeys } from '@/context/modal/modal.types'

import { InfoIcon } from '@/assets/icons'

import { ACTION_MESSAGES, ActionStatus } from '@/constants'

interface ProcessingModalProps {
  title?: string
  message?: string
  onClose?: () => void
  modalStyles?: SxProps<Theme>
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  title,
  message,
  onClose,
  modalStyles,
}) => {
  const theme = useTheme()
  const { closeModal } = useModalState()
  const { t } = useTranslation()

  const handleClose = () => {
    onClose?.()
    closeModal(ModalsKeys.TRANSACTION_PROCESSING)
  }

  return (
    <CustomModal
      modalKey={ModalsKeys.TRANSACTION_PROCESSING}
      hideActionIcon
      onAction={handleClose}
      modalStyles={{
        top: '50%',
        width: '50%',
        height: 110,
        pt: 0,
        backgroundColor: theme.palette.info.main,
        ...modalStyles,
      }}
    >
      <Box display='flex' flexDirection='column' pl={1}>
        <Box display='flex' alignItems='center'>
          <InfoIcon />
          <Typography variant='subtitle1' ml={1}>
            {title || t('modals.lock.processing.title')}
          </Typography>
        </Box>

        <Box sx={{ width: '100%', mt: 1 }}>
          <Typography variant='body2' mb={1}>
            {message || ACTION_MESSAGES[ActionStatus.PROCESSING]}
          </Typography>
          <LinearProgress />
        </Box>
      </Box>
    </CustomModal>
  )
}

export default ProcessingModal
