import { Box, Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import TrancheGrossApyTooltip from '@/components/molecules/tooltips/TrancheGrossApyTooltip'

import { ModalsKeys } from '@/context/modal/modal.types'

import dayjs from '@/dayjs'
import {
  formatAmount,
  formatPercentage,
  formatTimestamp,
  mergeSubheading,
} from '@/utils'

const LendingModalReviewOverview = () => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

  const { amount, amountInUSD, trancheId, fixedTermConfigId } =
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
    {
      format: 'DD.MM.YYYY HH:mm:ss',
      includeUtcOffset: true,
    }
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
        metric={
          <Typography variant='baseMdBold'>
            {mergeSubheading(pool.poolName, pool.subheading)}
          </Typography>
        }
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
              title={t('modals.lending.review.metric-4-tooltip')}
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
        title={fixedTermApy ? t('general.fixedApy') : t('general.variableApy')}
        toolTipInfo={
          <ToolTip
            title={<TrancheGrossApyTooltip />}
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
      {fixedTermApy && (
        <InfoRow
          title={t('modals.lending.review.metric-5')}
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
          dividerProps={{
            color: 'white',
          }}
        />
      )}
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
