import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { Box, Paper, Typography } from '@mui/material'
import React, { useMemo } from 'react'

import useUserLendingBalance from '@/hooks/portfolio/useUserLendingBalance'

import PieChart from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/PieChart'

import { formatAmount, mapFixedLoanToConfig } from '@/utils'

type LiteLendingPortfolioChartProps = {
  portfolioLendingPools: PortfolioLendingPool[]
}

const LiteLendingPortfolioChart: React.FC<LiteLendingPortfolioChartProps> = ({
  portfolioLendingPools,
}) => {
  const { userLendingBalance } = useUserLendingBalance(portfolioLendingPools)

  const data = useMemo(
    () =>
      userLendingBalance
        ? userLendingBalance.map(({ id, tranches }) => {
            const trancheInvestedAmount = tranches.reduce((acc, cur) => {
              const mappedFixedTermConfig = mapFixedLoanToConfig(
                cur.fixedLoans,
                cur.fixedTermConfig
              )

              const ftdInvestedAmount = mappedFixedTermConfig.reduce(
                (acc, cur) => {
                  return acc + parseFloat(cur.investedAmount)
                },
                0
              )

              return acc + parseFloat(cur.investedAmount) + ftdInvestedAmount
            }, 0)

            return {
              id,
              investedAmount: trancheInvestedAmount,
            }
          })
        : undefined,
    [userLendingBalance]
  )
  if (!data) return null

  return (
    <Box height={139}>
      <PieChart
        data={data.map(({ id, investedAmount }, index, og) => ({
          id,
          label: 'Balance',
          value: investedAmount,
          color: `color-mix(in oklab, rgba(236, 206, 158, 1) ${((index + 1) / og.length) * 100}%, rgba(171, 129, 85, 1))`,
        }))}
        tooltip={({ datum }) => (
          <Paper
            sx={{ display: 'flex', alignItems: 'center', p: 1, width: 200 }}
          >
            <Box
              boxShadow='0 0 15px 0 rgba(0,0,0, 0.5)'
              bgcolor={datum.color}
              width={12}
              height={12}
              mr={1}
            />
            <Typography variant='baseSm'>{datum.label} :&nbsp;</Typography>
            <Typography variant='baseSmBold'>
              {formatAmount(datum.value, {
                minDecimals: 2,
                minValue: 1_000_000,
              })}{' '}
              USDC
            </Typography>
          </Paper>
        )}
      />
    </Box>
  )
}

export default LiteLendingPortfolioChart
