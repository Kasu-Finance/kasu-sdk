import { Box, Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import GrossApyTooltip from '@/components/molecules/tooltips/GrossApyTooltip'

import { ModalsKeys } from '@/context/modal/modal.types'

import dayjs from '@/dayjs'
import {
  formatAmount,
  formatPercentage,
  formatTimestamp,
  formatToNearestTime,
  TimeConversions,
} from '@/utils'

const LendingModalReviewOverview = () => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

  const { amount, amountInUSD, trancheId, fixedTermConfigId } =
    useDepositModalState()

  const formattedTimeNow = formatTimestamp(dayjs().unix(), {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const selectedTranche = pool.tranches.find(
    (tranche) => tranche.id === trancheId
  )

  const fixedTermApy = selectedTranche?.fixedTermConfig.find(
    ({ configId }) => configId === fixedTermConfigId
  )

  return (
    <Box>
      <InfoRow
        title={t('modals.lending.review.metric-1')}
        toolTipInfo={
          <ToolTip
            title={t('modals.lending.review.metric-1-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={<Typography variant='baseMdBold'>{pool.poolName}</Typography>}
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
      {pool.tranches.length > 1 && selectedTranche && (
        <InfoRow
          title={t('general.tranche')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lending.review.metric-5-tooltip')}
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
              {selectedTranche.name} {t('general.tranche')}
            </Typography>
          }
          showDivider
          dividerProps={{
            color: 'white',
          }}
        />
      )}

      <InfoRow
        title={`${pool.tranches.length > 1 ? t('general.tranche') : ''} ${t('general.apy')}`}
        toolTipInfo={
          <ToolTip
            title='info'
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold' display='flex' alignItems='center'>
            {fixedTermApy
              ? `${t('general.fixedApy')}, ~ ${formatToNearestTime(
                  parseFloat(fixedTermApy.epochLockDuration) *
                    TimeConversions.DAYS_PER_WEEK *
                    TimeConversions.SECONDS_PER_DAY *
                    1000
                )}`
              : t('general.variableApy')}
            <ToolTip
              title={<GrossApyTooltip />}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': {
                  color: 'rgba(133, 87, 38, 1)',
                },
              }}
            />
            {formatPercentage(
              fixedTermApy ? fixedTermApy.apy : selectedTranche?.apy || '0'
            )}
          </Typography>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />

      <InfoRow
        title={t('modals.lending.review.metric-3')}
        toolTipInfo={
          <ToolTip
            title={t('modals.lending.review.metric-3-tooltip')}
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
            {formatAmount(amountInUSD || amount || '0', {
              minDecimals: 2,
              maxDecimals: 4,
            })}{' '}
            USDC
          </Typography>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
      <InfoRow
        title={t('modals.lending.review.metric-2')}
        toolTipInfo={
          <ToolTip
            title={t('modals.lending.review.metric-2-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
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
        dividerProps={{
          color: 'white',
        }}
      />
    </Box>
  )
}

export default LendingModalReviewOverview
