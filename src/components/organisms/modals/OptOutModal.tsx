import { Box, Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAccount, formatAmount, formatTimestamp } from '@/utils'

const OptOutModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { address } = usePrivyAuthenticated()

  const { subsequentTransaction, poolName } = modal[ModalsKeys.OPT_OUT]

  const { nextEpochTime } = useNextEpochTime()

  const formattedNextEpochTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <CustomCard>
      <DialogHeader title={t('modals.optOut.title')} onClose={handleClose} />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        <Stack alignItems='center' spacing={3}>
          <Typography variant='baseMd'>
            <Typography variant='baseMdBold'>
              {formatAmount(subsequentTransaction.amount, { minDecimals: 2 })}{' '}
              USDC{' '}
            </Typography>
            {t('modals.optOut.description-1')} ({formattedNextEpochTime.date} •{' '}
            {formattedNextEpochTime.timestamp}{' '}
            {formattedNextEpochTime.utcOffset}){' '}
            {t('modals.optOut.description-2')}{' '}
            <Typography variant='baseMdBold'>{poolName}</Typography>
            {t('modals.optOut.description-3')}{' '}
            <Typography variant='baseMdBold'>
              {formatAccount(address)}
            </Typography>
          </Typography>
          <Box bgcolor='gold.dark' p={2} borderRadius={2} width='100%'>
            <Typography variant='baseMd'>
              {t('modals.optOut.nextEpoch')}
            </Typography>
          </Box>
          <Button
            variant='contained'
            color='dark'
            fullWidth
            onClick={handleClose}
            sx={{ textTransform: 'capitalize' }}
          >
            {t('general.close')}
          </Button>
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default OptOutModal
