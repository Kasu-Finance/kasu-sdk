import { Box, Button, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

const WithdrawFundsAtExpiryModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.withdrawFundsAtExpiry.title')}
        onClose={handleClose}
      />
      <DialogContent>
        <Stack spacing={3}>
          <Typography variant='baseMd'>
            {t('modals.withdrawFundsAtExpiry.description-1')}{' '}
            <Typography variant='baseMdBold'>
              {t('modals.withdrawFundsAtExpiry.description-2').replace(
                '{{ epoch }}',
                '4'
              )}{' '}
            </Typography>
            {t('modals.withdrawFundsAtExpiry.description-3')}
          </Typography>
          <Box display='flex' gap={4}>
            <Button
              variant='outlined'
              color='secondary'
              onClick={handleClose}
              fullWidth
              sx={{ textTransform: 'capitalize' }}
            >
              {t('general.close')}
            </Button>
            <Button
              variant='contained'
              color='secondary'
              onClick={undefined}
              fullWidth
              sx={{ textTransform: 'capitalize' }}
            >
              {t('modals.withdrawFundsAtExpiry.action')}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default WithdrawFundsAtExpiryModal
