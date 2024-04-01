import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
  useTheme,
} from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import { ACTION_MESSAGES, ActionStatus } from '@/constants'

interface ProcessingModalProps {
  handleClose: () => void
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ handleClose }) => {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Dialog open onClose={handleClose}>
      <DialogTitle
        sx={{ background: theme.palette.info.main, minWidth: '500px' }}
      >
        <Box display='flex' alignItems='center'>
          <InfoOutlinedIcon color='primary' />
          <Typography variant='h6' ml={1}>
            {t('modals.lock.processing.title')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ background: theme.palette.info.main, pl: 7 }}>
        <Box display='flex' flexDirection='column' alignItems='start'>
          <Box display='flex' alignItems='center' mb={2}>
            <Typography variant='body2'>
              {ACTION_MESSAGES[ActionStatus.PROCESSING]}
            </Typography>
          </Box>
          <LinearProgress style={{ width: '100%' }} />
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ProcessingModal
