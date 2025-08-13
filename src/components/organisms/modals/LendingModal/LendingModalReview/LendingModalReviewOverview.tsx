import { Box, Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import GrossApyTooltip from '@/components/molecules/tooltips/GrossApyTooltip'
import TrancheGrossApyTooltip from '@/components/molecules/tooltips/TrancheGrossApyTooltip'

import dayjs from '@/dayjs'
import {
  formatAmount,
  formatPercentage,
  formatTimestamp,
  formatToNearestTime,
  mergeSubheading,
  TimeConversions,
} from '@/utils'

const LendingModalReviewOverview = () => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  const { amount, pool, amountInUSD, trancheId, fixedTermConfigId } =
    useDepositModalState()

  const formattedTimeNow = formatTimestamp(dayjs().unix(), {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const { nextEpochTime } = useNextEpochTime()

  const selectedTranche = pool.tranches.find(
    (tranche) => tranche.id === trancheId
  )

  const fixedTermApy = selectedTranche?.fixedTermConfig.find(
    ({ configId }) => configId === fixedTermConfigId
  )

  const ftdExpiryTime = formatTimestamp(
    dayjs
      .unix(nextEpochTime)
      .add(
        fixedTermApy?.epochLockDuration
          ? parseFloat(fixedTermApy.epochLockDuration)
          : 0,
        'weeks'
      )
      .unix(),
    { format: 'DD.MM.YYYY HH:mm:ss', includeUtcOffset: true }
  )

  return (
    <Box>
      <InfoRow
        title={t('modals.lending.review.metric-1')}
        toolTipInfo={
          !isLiteMode && (
            <ToolTip
              title={t('modals.lending.review.metric-1-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': { color: 'rgba(133, 87, 38, 1)' },
              }}
            />
          )
        }
        metric={
          <Typography variant='baseMdBold'>
            {mergeSubheading(pool.poolName, pool.subheading)}
          </Typography>
        }
        showDivider
        dividerProps={{ color: 'white' }}
      />
      {pool.tranches.length > 1 && selectedTranche && (
        <InfoRow
          title={t('general.tranche')}
          toolTipInfo={
            !isLiteMode && (
              <ToolTip
                title={t('modals.lending.review.metric-4-tooltip')}
                iconSx={{
                  color: 'gold.extraDark',
                  '&:hover': { color: 'rgba(133, 87, 38, 1)' },
                }}
              />
            )
          }
          metric={
            <Typography variant='baseMdBold'>
              {selectedTranche.name} {t('general.tranche')}
            </Typography>
          }
          showDivider
          dividerProps={{ color: 'white' }}
        />
      )}

      <InfoRow
        title={`${pool.tranches.length > 1 ? t('general.tranche') : ''} ${t('general.grossApy')}`}
        toolTipInfo={
          !isLiteMode && (
            <ToolTip
              title={<TrancheGrossApyTooltip />}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': { color: 'rgba(133, 87, 38, 1)' },
              }}
            />
          )
        }
        metric={
          <Typography variant='baseMdBold' display='flex' alignItems='center'>
            {!isLiteMode && (
              <>
                {fixedTermApy
                  ? `${t('general.fixedApy')}, ${fixedTermApy.epochLockDuration} ${t('general.epoch')} (~${formatToNearestTime(
                      parseFloat(fixedTermApy.epochLockDuration) *
                        TimeConversions.DAYS_PER_WEEK *
                        TimeConversions.SECONDS_PER_DAY *
                        1000
                    )})`
                  : t('general.variableApy')}
                <ToolTip
                  title={<GrossApyTooltip />}
                  iconSx={{
                    color: 'gold.extraDark',
                    '&:hover': { color: 'rgba(133, 87, 38, 1)' },
                  }}
                />
              </>
            )}
            {formatPercentage(
              fixedTermApy && !isLiteMode
                ? fixedTermApy.apy
                : selectedTranche?.apy || '0'
            ).trim()}
          </Typography>
        }
        showDivider
        dividerProps={{ color: 'white' }}
      />
      <InfoRow
        title={t('modals.lending.review.metric-3')}
        toolTipInfo={
          !isLiteMode && (
            <ToolTip
              title={t('modals.lending.review.metric-3-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': { color: 'rgba(133, 87, 38, 1)' },
              }}
            />
          )
        }
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(amountInUSD || amount || '0', {
              minDecimals: 2,
              maxDecimals: 4,
            })}{' '}
            USDC
          </Typography>
        }
        showDivider
        dividerProps={{ color: 'white' }}
      />

      {fixedTermApy && !isLiteMode && (
        <InfoRow
          title={t('modals.lending.review.metric-5')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lending.review.metric-5-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': { color: 'rgba(133, 87, 38, 1)' },
              }}
            />
          }
          metric={
            <Box>
              <Typography variant='baseMdBold'>
                {ftdExpiryTime.date}{' '}
              </Typography>
              <Typography variant='baseMd' color='gold.extraDark'>
                {ftdExpiryTime.timestamp} {ftdExpiryTime.utcOffset}
              </Typography>
            </Box>
          }
          showDivider
          dividerProps={{ color: 'white' }}
        />
      )}
      {!isLiteMode && (
        <InfoRow
          title={t('modals.lending.review.metric-2')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lending.review.metric-2-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': { color: 'rgba(133, 87, 38, 1)' },
              }}
            />
          }
          metric={
            <Box>
              <Typography variant='baseMdBold'>
                {formattedTimeNow.date}{' '}
              </Typography>
              <Typography variant='baseMd' color='gold.extraDark'>
                {formattedTimeNow.timestamp} {formattedTimeNow.utcOffset}
              </Typography>
            </Box>
          }
          showDivider
          dividerProps={{ color: 'white' }}
        />
      )}
    </Box>
  )
}

export default LendingModalReviewOverview
