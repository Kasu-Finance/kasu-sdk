import { Box, CardContent, Stack, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import WaveBox from '@/components/atoms/WaveBox'

import { formatAmount, formatPercentage } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolCardContentProps = {
  pool: PoolOverviewWithDelegate
}

const PoolCardContent: React.FC<PoolCardContentProps> = ({ pool }) => {
  const { t } = useTranslation()

  const isMultiTranche = pool.tranches.length > 1

  const isActivePool = pool.isActive

  return (
    <WaveBox width='100%'>
      <Box
        display='flex'
        justifyContent='space-around'
        alignItems='center'
        my={3}
      >
        {pool.tranches.map(({ name, apy }) => (
          <Stack key={name} alignItems='center'>
            <Typography
              variant='baseMdBold'
              color='primary.main'
              textTransform='capitalize'
            >
              {isMultiTranche ? name : t('general.lendingStrategy')}
            </Typography>
            <Typography variant='baseSm' display='block' mt={1}>
              {isMultiTranche && t('general.tranche')} {t('general.apy')}
            </Typography>
            <Typography variant='h3' color='primary.main'>
              {formatPercentage(apy).replaceAll(' ', '')}
            </Typography>
          </Stack>
        ))}
      </Box>
      <CardContent
        sx={{ borderRadius: 2, bgcolor: 'white', '&:last-child': { pb: 2.5 } }}
      >
        {!isActivePool && (
          <InfoRow
            title={t('general.tvl')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('lending.poolOverview.detailCard.tvl.tooltip')}
            showDivider
            metric={
              <TokenAmount
                amount={formatAmount(
                  pool.delegate.totalLoanFundsOriginated || '0',
                  {
                    minValue: 1_000_000,
                  }
                )}
                symbol='USDC'
                amountProps={{
                  variant: 'baseMdBold',
                  color: 'gray.extraDark',
                }}
                symbolProps={{ variant: 'baseMdBold' }}
              />
            }
          />
        )}
        {!isActivePool && (
          <InfoRow
            title={t('lending.poolOverview.detailCard.loansUnder.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t(
              'lending.poolOverview.detailCard.loansUnder.tooltip'
            )}
            showDivider
            metric={
              <TokenAmount
                amount={formatAmount(
                  pool.delegate.totalLoanFundsOriginated || '0',
                  {
                    minValue: 1_000_000,
                  }
                )}
                symbol='USDC'
                amountProps={{
                  variant: 'baseMdBold',
                  color: 'gray.extraDark',
                }}
                symbolProps={{ variant: 'baseMdBold' }}
              />
            }
          />
        )}
        <InfoRow
          title={t('details.poolDelegate.totalFunds.label')}
          titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
          toolTipInfo={t('details.poolDelegate.totalFunds.tooltip')}
          showDivider
          metric={
            <TokenAmount
              amount={formatAmount(
                pool.delegate.totalLoanFundsOriginated || '0',
                {
                  minValue: 1_000_000,
                }
              )}
              symbol='USDC'
              amountProps={{
                variant: 'baseMdBold',
                color: 'gray.extraDark',
              }}
              symbolProps={{ variant: 'baseMdBold' }}
            />
          }
        />
        {isActivePool && (
          <InfoRow
            title={t('details.poolDelegate.history.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('details.poolDelegate.history.tooltip')}
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {formatDuration(pool.delegate.delegateLendingHistory, {
                  years: true,
                  months: true,
                })}
              </Typography>
            }
          />
        )}
        <InfoRow
          title={t('details.poolDelegate.totalLossRate.label')}
          titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
          toolTipInfo={t('details.poolDelegate.totalLossRate.tooltip')}
          showDivider
          metric={
            <TokenAmount
              amount={formatPercentage(pool.delegate.historicLossRate)}
              symbol=''
              amountProps={{
                variant: 'baseMdBold',
                color: 'gray.extraDark',
              }}
              symbolProps={{ variant: 'baseMdBold' }}
            />
          }
        />
        <InfoRow
          title={t('details.poolDetails.assetClass.label')}
          titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
          toolTipInfo={t('details.poolDetails.assetClass.tooltip')}
          showDivider
          metric={
            <Typography variant='baseMdBold'>{pool.assetClass}</Typography>
          }
          sx={{ flexWrap: 'wrap' }}
        />
        {isActivePool && (
          <InfoRow
            title={t('lending.poolOverview.detailCard.security.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('lending.poolOverview.detailCard.security.tooltip')}
            showDivider
            metric={
              <Typography variant='baseMdBold'>{pool.security}</Typography>
            }
            sx={{ flexWrap: 'wrap' }}
          />
        )}
      </CardContent>
    </WaveBox>
  )
}

export default PoolCardContent
