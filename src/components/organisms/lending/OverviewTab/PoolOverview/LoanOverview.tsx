import { Box, Divider, Grid, Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import VariableAndFixedApyTooltip from '@/components/molecules/tooltips/VariableAndFixedApyTooltip'

import {
  formatAmount,
  formatPercentage,
  formatToNearestTime,
  TimeConversions,
} from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type LoanOverviewProps = {
  pool: PoolOverviewWithDelegate
}

const LoanOverview: React.FC<LoanOverviewProps> = ({ pool }) => {
  const { t } = getTranslation()

  const isMultiTranche = pool.tranches.length > 1

  return (
    <Grid container spacing={4}>
      {pool.tranches.map((tranche) => (
        <Grid
          item
          key={tranche.id}
          flex={1}
          display='flex'
          flexDirection='column'
        >
          <Typography variant='h5'>
            {isMultiTranche
              ? `${tranche.name} ${t('general.tranche')}`
              : t('lending.poolOverview.subtitle')}
          </Typography>
          <Divider sx={{ mt: 1.5 }} />
          <InfoRow
            title={t('general.variableApy')}
            titleStyle={{
              variant: 'h5',
            }}
            toolTipInfo={<ToolTip title={<VariableAndFixedApyTooltip />} />}
            metric={
              <Typography variant='h5' color='gold.dark'>
                {formatPercentage(tranche.apy).replaceAll(' ', '')}
              </Typography>
            }
            showDivider
          />
          {tranche.fixedTermConfig.map(
            ({ epochLockDuration, apy, configId }) => {
              const durationInMs =
                parseFloat(epochLockDuration) *
                TimeConversions.DAYS_PER_WEEK *
                TimeConversions.SECONDS_PER_DAY *
                1000

              return (
                <InfoRow
                  key={configId}
                  title={`${t('general.fixedApy')}, ~ ${formatToNearestTime(durationInMs)}`}
                  toolTipInfo={
                    <ToolTip title={<VariableAndFixedApyTooltip />} />
                  }
                  titleStyle={{
                    variant: 'h5',
                  }}
                  metric={
                    <Typography variant='h5' color='gold.dark'>
                      {formatPercentage(apy).replaceAll(' ', '')}
                    </Typography>
                  }
                  showDivider
                />
              )
            }
          )}
          <InfoRow
            title={t(
              'lending.poolOverview.trancheCard.remainingCapacity.label'
            )}
            toolTipInfo={t(
              'lending.poolOverview.trancheCard.remainingCapacity.tooltip'
            )}
            showDivider
            metric={
              <Box>
                <Typography variant='baseMdBold'>
                  {formatPercentage(tranche.poolCapacityPercentage)}{' '}
                </Typography>
                <Typography variant='baseMd' color='gray.middle'>
                  {formatAmount(tranche.poolCapacity, {
                    minDecimals: 2,
                  })}{' '}
                  USDC
                </Typography>
              </Box>
            }
            sx={{
              mt: 'auto',
            }}
          />
          <InfoRow
            title={t('lending.poolOverview.trancheCard.minDeposit')}
            toolTipInfo={t(
              'lending.poolOverview.trancheCard.minDeposit-tooltip'
            )}
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {formatAmount(tranche.minimumDeposit || '0', {
                  minValue: 10_000_000,
                  minDecimals: 2,
                })}{' '}
                USDC
              </Typography>
            }
          />
          <InfoRow
            title={t('lending.poolOverview.trancheCard.maxDeposit')}
            toolTipInfo={t(
              'lending.poolOverview.trancheCard.maxDeposit-tooltip'
            )}
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {formatAmount(tranche.maximumDeposit || '0', {
                  minValue: 10_000_000,
                  minDecimals: 2,
                })}{' '}
                USDC
              </Typography>
            }
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default LoanOverview
