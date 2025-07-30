import { Box, TableCell, TableRow, Typography } from '@mui/material'
import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import React, { Fragment } from 'react'

import useUserLendingTrancheBalance from '@/hooks/lending/useUserLendingTrancheBalance'

import DottedDivider from '@/components/atoms/DottedDivider'

import { formatAmount, formatPercentage, mapFixedLoanToConfig } from '@/utils'

type LiteLendingPortfolioTableRowProps = {
  portfolioLendingPool: PortfolioLendingPool
  poolPositionPercentage: number
}

const LiteLendingPortfolioTableRow: React.FC<
  LiteLendingPortfolioTableRowProps
> = ({ portfolioLendingPool, poolPositionPercentage }) => {
  const { userLendingTrancheBalance } = useUserLendingTrancheBalance(
    portfolioLendingPool.id,
    portfolioLendingPool.tranches
  )

  return (userLendingTrancheBalance ?? portfolioLendingPool.tranches).map(
    (tranche, index) => {
      const mappedFixedTermConfig = mapFixedLoanToConfig(
        tranche.fixedLoans,
        tranche.fixedTermConfig
      )

      const fixedTermDeposit = mappedFixedTermConfig.reduce(
        (acc, cur) => {
          acc.investedAmount += parseFloat(cur.investedAmount)
          acc.lifetimeYield += parseFloat(cur.yieldEarnings.lifetime)

          return acc
        },
        { investedAmount: 0, lifetimeYield: 0 }
      )

      return (
        <Fragment key={index}>
          <TableRow
            sx={{
              '.MuiTableCell-root': {
                py: 1,
              },
            }}
          >
            <TableCell>
              {index === 0 && (
                <Box display='flex' alignItems='center' gap={1}>
                  <Box
                    width={16}
                    height={16}
                    borderRadius={1}
                    bgcolor={`color-mix(in oklab, rgba(236, 206, 158, 1) ${poolPositionPercentage}%, rgba(171, 129, 85, 1))`}
                  />

                  <Typography variant='inherit'>
                    {portfolioLendingPool.poolName}
                  </Typography>
                </Box>
              )}
            </TableCell>
            <TableCell align='left'>{tranche.name}</TableCell>
            <TableCell align='right'>
              {formatAmount(
                parseFloat(tranche.investedAmount) +
                  fixedTermDeposit.investedAmount,
                { minDecimals: 2 }
              )}{' '}
              USDC
            </TableCell>
            <TableCell align='right'>
              {formatPercentage(tranche.apy).replaceAll(' ', '')}
            </TableCell>
            <TableCell align='right'>
              {formatAmount(
                parseFloat(tranche.yieldEarnings.lifetime) +
                  fixedTermDeposit.lifetimeYield,
                { minDecimals: 2 }
              )}{' '}
              USDDC
            </TableCell>
          </TableRow>
          <TableRow>
            {index === 0 && <TableCell padding='none' />}
            <TableCell colSpan={index === 0 ? 4 : 5} padding='none'>
              <DottedDivider />
            </TableCell>
          </TableRow>
        </Fragment>
      )
    }
  )
}

export default LiteLendingPortfolioTableRow
