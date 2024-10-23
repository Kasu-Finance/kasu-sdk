import { Box, Button, Stack, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

import { formatAmount, formatTimestamp } from '@/utils'

const OptOutModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { account } = useWeb3React()

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
              {formatAmount(1_000, { minDecimals: 2 })} USDC{' '}
            </Typography>
            {t('modals.optOut.description-1')} ({formattedNextEpochTime.date} •{' '}
            {formattedNextEpochTime.timestamp}{' '}
            {formattedNextEpochTime.utcOffset}){' '}
            {t('modals.optOut.description-2')}{' '}
            <Typography variant='baseMdBold'>Lending Strategy </Typography>
            {t('modals.optOut.description-3')}{' '}
            <Typography variant='baseMdBold'>{account}</Typography>
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
