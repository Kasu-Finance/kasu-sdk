import { Divider, TableCell, TableRow, Typography } from '@mui/material'
import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'

import useCalculatePortfolioAverage from '@/hooks/lending/useCalculatePortfolioAverage'
import useCalculatePortfolioTotal from '@/hooks/lending/useCalculatePortfolioTotal'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import InfoRow from '@/components/atoms/InfoRow'

import { formatAmount, formatPercentage } from '@/utils'

type LendingPortfolioTableFooterProps = {
  lendingPortfolio: PortfolioLendingPool[]
}

const LendingPortfolioMobileTableFooter: React.FC<
  LendingPortfolioTableFooterProps
> = ({ lendingPortfolio }) => {
  const totalValues = useCalculatePortfolioTotal(lendingPortfolio)

  const averageValues = useCalculatePortfolioAverage(
    totalValues,
    lendingPortfolio
  )

  const { t } = useTranslation()

  return (
    <>
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            px: 0,
            py: '6px',
          },
        }}
      >
        <TableCell colSpan={7}>
          <ColoredBox sx={{ p: 1, mt: 2 }}>
            <Typography variant='subtitle2' component='span'>
              {t('general.average')}
            </Typography>
            <InfoRow
              title={`${t('general.weighted')} ${t('general.apy')}`}
              titleStyle={{ fontSize: 11 }}
              showDivider
              sx={{ px: 0 }}
              metric={
                <Typography variant='body2'>
                  {formatPercentage(averageValues.weightedApy)}
                </Typography>
              }
            />
            <InfoColumn
              title={`${t('portfolio.lendingPortfolio.lendingBalance')} ${t('general.perTranche')}`}
              titleStyle={{ fontSize: 11 }}
              titleContainerSx={{ px: 0, pb: 0 }}
              metric={
                <Typography variant='body2' component='span'>
                  {formatAmount(
                    formatEther(averageValues.investedAmount || '0'),
                    {
                      minValue: 100_000,
                    }
                  )}{' '}
                  USDC
                </Typography>
              }
            />
            <Divider
              sx={{ backgroundColor: 'rgba(224, 193, 156, 0.12)', mt: 1 }}
            />
            <InfoColumn
              title={`${t('portfolio.lendingPortfolio.interestEarningsClaimable')} ${t('general.perPool')}`}
              titleStyle={{ fontSize: 11 }}
              titleContainerSx={{
                px: 0,
                pb: 0,
              }}
              metric={
                <Typography variant='body2' component='span'>
                  {formatAmount(formatEther(averageValues.lastEpoch || '0'), {
                    minValue: 100_000,
                  })}{' '}
                  USDC
                </Typography>
              }
            />
            <Divider
              sx={{ backgroundColor: 'rgba(224, 193, 156, 0.12)', mt: 1 }}
            />
            <InfoColumn
              title={`${t('portfolio.lendingPortfolio.interestEarningsLifetime')} ${t('general.perPool')}`}
              titleStyle={{ fontSize: 11 }}
              titleContainerSx={{
                px: 0,
                pb: 0,
              }}
              metric={
                <Typography variant='body2' component='span'>
                  {formatAmount(formatEther(averageValues.lifeTime || '0'), {
                    minValue: 100_000,
                  })}{' '}
                  USDC
                </Typography>
              }
            />
          </ColoredBox>
          <ColoredBox sx={{ p: 1, mt: 1 }}>
            <Typography variant='subtitle2' component='span'>
              {t('general.total')}
            </Typography>
            <InfoRow
              title={t('portfolio.lendingPortfolio.lendingBalance')}
              titleStyle={{ fontSize: 11 }}
              showDivider
              sx={{ px: 0 }}
              metric={
                <Typography variant='body2'>
                  {formatAmount(
                    formatEther(totalValues.investedAmount || '0'),
                    {
                      minValue: 100_000,
                    }
                  )}{' '}
                  USDC
                </Typography>
              }
            />
            <InfoRow
              title={t('portfolio.lendingPortfolio.interestEarningsClaimable')}
              titleStyle={{ fontSize: 11 }}
              showDivider
              sx={{ px: 0 }}
              metric={
                <Typography variant='body2'>
                  {formatAmount(formatEther(totalValues.lastEpoch || '0'), {
                    minValue: 100_000,
                  })}{' '}
                  USDC
                </Typography>
              }
            />
            <InfoRow
              title={t('portfolio.lendingPortfolio.interestEarningsLifetime')}
              titleStyle={{ fontSize: 11 }}
              sx={{ px: 0 }}
              metric={
                <Typography variant='body2'>
                  {formatAmount(formatEther(totalValues.lifeTime || '0'), {
                    minValue: 100_000,
                  })}{' '}
                  USDC
                </Typography>
              }
            />
          </ColoredBox>
        </TableCell>
      </TableRow>
    </>
  )
}

export default LendingPortfolioMobileTableFooter
