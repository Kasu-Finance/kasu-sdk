import { PortfolioLendingPool } from '@kasufinance/kasu-sdk'
import { Box, TableCell, TableRow, Typography } from '@mui/material'
import React, { Fragment } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'

import {
  formatAmount,
  formatPercentage,
  mapFixedLoanToConfig,
  toBigNumber,
} from '@/utils'

type LiteLendingPortfolioTableRowProps = {
  portfolioLendingPool: PortfolioLendingPool
  poolPositionPercentage: number
}

const LiteLendingPortfolioTableRow: React.FC<
  LiteLendingPortfolioTableRowProps
> = ({ portfolioLendingPool, poolPositionPercentage }) => {
  const rows = portfolioLendingPool.tranches.flatMap((tranche) => {
    const mappedFixedTermConfig = mapFixedLoanToConfig(
      tranche.fixedLoans,
      tranche.fixedTermConfig
    )

    const hasDepositedIntoVariable =
      !toBigNumber(tranche.investedAmount ?? '0').isZero() ||
      !toBigNumber(tranche.yieldEarnings.lifetime ?? '0').isZero()

    const trancheRows: Array<{
      key: string
      trancheName: string
      apy: string
      investedAmount: string
      lifetimeYield: string
    }> = []

    if (hasDepositedIntoVariable) {
      trancheRows.push({
        key: `${tranche.id}-variable`,
        trancheName: tranche.name,
        apy: tranche.apy,
        investedAmount: tranche.investedAmount ?? '0',
        lifetimeYield: tranche.yieldEarnings.lifetime ?? '0',
      })
    }

    mappedFixedTermConfig.forEach((fixedTermConfig) => {
      trancheRows.push({
        key: `${tranche.id}-fixed-${fixedTermConfig.configId}`,
        trancheName: tranche.name,
        apy: fixedTermConfig.apy,
        investedAmount: fixedTermConfig.investedAmount ?? '0',
        lifetimeYield: fixedTermConfig.yieldEarnings.lifetime ?? '0',
      })
    })

    return trancheRows
  })

  return rows.map((row, rowIndex) => {
    const showPoolName = rowIndex === 0

    return (
      <Fragment key={row.key}>
        <TableRow
          sx={{
            '.MuiTableCell-root': {
              py: 1,
            },
          }}
        >
          <TableCell>
            {showPoolName && (
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
          <TableCell align='left'>{row.trancheName}</TableCell>
          <TableCell align='right'>
            {formatAmount(row.investedAmount, { minDecimals: 2 })} USDC
          </TableCell>
          <TableCell align='right'>{formatPercentage(row.apy)}</TableCell>
          <TableCell align='right'>
            {formatAmount(row.lifetimeYield, { minDecimals: 2 })} USDDC
          </TableCell>
        </TableRow>
        <TableRow>
          {showPoolName && <TableCell padding='none' />}
          <TableCell colSpan={showPoolName ? 4 : 5} padding='none'>
            <DottedDivider />
          </TableCell>
        </TableRow>
      </Fragment>
    )
  })
}

export default LiteLendingPortfolioTableRow
