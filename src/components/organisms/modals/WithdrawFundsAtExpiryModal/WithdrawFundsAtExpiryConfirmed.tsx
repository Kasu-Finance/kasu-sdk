import { Button, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'

const WithdrawFundsAtExpiryConfirmed: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = getTranslation()

  return (
    <Stack p={2} spacing={3}>
      <Typography variant='baseMd' textAlign='center' sx={{ maxWidth: 528 }}>
        {t('modals.withdrawFundsAtExpiry.description-4')}
      </Typography>
      <Button
        variant='contained'
        color='secondary'
        fullWidth
        sx={{ textTransform: 'capitalize' }}
        onClick={handleClose}
      >
        {t('general.close')}
      </Button>
    </Stack>
  )
}

export default WithdrawFundsAtExpiryConfirmed
