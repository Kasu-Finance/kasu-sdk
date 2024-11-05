import { Box, Skeleton, Stack, Typography } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import UnlockModalReviewActions from '@/components/organisms/modals/UnlockModal/UnlockModalReview/UnlockModalReviewActions'

import { formatAmount, formatTimestamp } from '@/utils'

const UnlockModalReview = () => {
  const { t } = getTranslation()

  const { amount } = useLockModalState()

  const { nextEpochTime, isLoading } = useNextEpochTime()

  const formattedTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Stack spacing={3}>
      <InfoRow
        title={t('modals.unlock.withdraw.withdraw-metric-3')}
        toolTipInfo={
          <ToolTip
            title={t('modals.unlock.withdraw.withdraw-metric-3-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(amount || 0, {
              minDecimals: 2,
            })}{' '}
            KSU
          </Typography>
        }
      />
      <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
        <Typography variant='baseSm' color='white'>
          {t('modals.unlock.reviewLock.unlockingSchedule')}
        </Typography>
        <Typography
          variant='baseMd'
          display='flex'
          justifyContent='center'
          alignItems='center'
          mt={2}
        >
          {t('modals.unlock.reviewLock.epochEnds')}&nbsp;
          {isLoading ? (
            <Skeleton
              variant='rounded'
              sx={{
                bgcolor: 'gold.extraDark',
                display: 'inline-block',
              }}
              width={200}
              height={21}
            />
          ) : (
            <Typography variant='baseMdBold'>
              {formattedTime.date} • {formattedTime.timestamp}{' '}
              {formattedTime.utcOffset}
            </Typography>
          )}
        </Typography>
      </Box>
      <UnlockModalReviewActions />
    </Stack>
  )
}

export default UnlockModalReview
