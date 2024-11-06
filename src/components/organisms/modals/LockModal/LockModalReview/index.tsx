import { Box, Skeleton, Stack, Typography } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import LockModalReviewActions from '@/components/organisms/modals/LockModal/LockModalReview/LockModalReviewActions'

import { formatAmount, formatTimestamp, formatToNearestTime } from '@/utils'

const LockModalReview = () => {
  const { t } = getTranslation()

  const { amount, selectedLockPeriod } = useLockModalState()

  const { nextEpochTime, isLoading } = useNextEpochTime()

  const formattedTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Stack spacing={3}>
      <Box>
        <InfoRow
          title={t('modals.lock.reviewLock.lockAmount')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lock.reviewLock.lockAmount-tooltip')}
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
          showDivider
          dividerProps={{
            color: 'white',
          }}
        />
        <InfoRow
          title={t('modals.lock.reviewLock.lockingDuration')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lock.reviewLock.lockingDuration-tooltip')}
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
              {formatToNearestTime(
                parseFloat(selectedLockPeriod.lockPeriod) * 1000
              )}
            </Typography>
          }
          showDivider
          dividerProps={{
            color: 'white',
          }}
        />
      </Box>

      <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
        <Typography variant='baseSm' color='white'>
          {t('modals.lock.reviewLock.depositSchedule')}
        </Typography>

        <Typography
          variant='baseMd'
          display='flex'
          justifyContent='center'
          alignItems='center'
          mt={2}
        >
          {t('modals.lock.reviewLock.epochEnds')}&nbsp;
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
      <LockModalReviewActions />
    </Stack>
  )
}

export default LockModalReview
