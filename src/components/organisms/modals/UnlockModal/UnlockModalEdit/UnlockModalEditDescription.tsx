import { Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { customTypography } from '@/themes/typography'

const UnlockModalEditDescription = () => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  return (
    <Stack>
      <Typography variant='h5'>
        {t('modals.unlock.withdraw.withdraw-title')}
      </Typography>
      <Typography variant='baseMd' mt={3}>
        {t('modals.unlock.withdraw.withdraw-description')}
      </Typography>
      <Button
        variant='text'
        onClick={handleOpen}
        sx={{
          p: 0,
          color: 'white',
          textTransform: 'unset',
          width: 'max-content',
          height: 'max-content',
          mt: 2,
          ...customTypography.baseMd,
        }}
      >
        {t('modals.unlock.withdraw.viewLoyaltylevels-button')}
      </Button>
    </Stack>
  )
}

export default UnlockModalEditDescription
