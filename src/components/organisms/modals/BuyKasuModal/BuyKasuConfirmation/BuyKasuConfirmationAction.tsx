import { Box, Button } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

const BuyKasuConfirmationAction = () => {
  const { t } = getTranslation()

  const { closeModal } = useModalState()

  const handleClose = () => closeModal(ModalsKeys.BUY_KASU)

  return (
    <Box>
      <Button
        variant='contained'
        color='secondary'
        fullWidth
        onClick={handleClose}
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.close')}
      </Button>
    </Box>
  )
}

export default BuyKasuConfirmationAction
