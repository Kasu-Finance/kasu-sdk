import { Box, Divider, Grid, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

import { formatAmount, formatPercentage } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type LoanOverviewProps = {
  pool: PoolOverviewWithDelegate
}

const LoanOverview: React.FC<LoanOverviewProps> = ({ pool }) => {
  const { t } = useTranslation()

  const isMultiTranche = pool.tranches.length > 1

  return (
    <Grid container spacing={4}>
      {pool.tranches.map((tranche) => (
        <Grid item key={tranche.id} flex={1}>
          <Typography variant='h5'>
            {isMultiTranche
              ? `${tranche.name} ${t('general.tranche')}`
              : t('lending.poolOverview.subtitle')}
          </Typography>
          <Divider sx={{ mt: 1.5 }} />
          <InfoRow
            title={t('general.apy')}
            titleStyle={{
              variant: 'h3',
            }}
            metric={
              <Typography variant='h3' color='gold.dark'>
                {formatPercentage(tranche.apy).replaceAll(' ', '')}
              </Typography>
            }
            showDivider
          />
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
          />
          <InfoRow
            title={t('lending.poolOverview.trancheCard.minDeposit')}
            toolTipInfo='info'
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
            toolTipInfo='info'
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
