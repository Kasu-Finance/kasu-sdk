import { alpha, Box, TableCell, TableRow, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import React, { ReactNode } from 'react'

import useCalculatePortfolioAverage from '@/hooks/lending/useCalculatePortfolioAverage'
import useCalculatePortfolioTotal from '@/hooks/lending/useCalculatePortfolioTotal'

import TokenAmount from '@/components/atoms/TokenAmount'
import { UserLendingPortfolio } from '@/components/organisms/portfolio/LendingPortfolioTable'

import { formatAmount, formatPercentage } from '@/utils'

type LendingPortfolioTableFooterProps = {
  lendingPortfolio: UserLendingPortfolio[]
}

type FooterCellProps = {
  value: ReactNode
  caption: string
}

const FooterCell: React.FC<FooterCellProps> = ({ value, caption, ...rest }) => (
  <TableCell {...rest}>
    <Box display='flex' flexDirection='column' alignItems='end'>
      {value}
      <Typography variant='caption' component='span'>
        {caption}
      </Typography>
    </Box>
  </TableCell>
)

const LendingPortfolioTableFooter: React.FC<
  LendingPortfolioTableFooterProps
> = ({ lendingPortfolio }) => {
  const totalValues = useCalculatePortfolioTotal(lendingPortfolio)

  const averageValues = useCalculatePortfolioAverage(
    totalValues,
    lendingPortfolio
  )

  return (
    <>
      <TableRow
        sx={(theme) => ({
          background: alpha(theme.palette.primary.main, 0.04),
          '& .MuiTableCell-root': {
            py: '6px',
          },
        })}
      >
        <TableCell>
          <Typography variant='subtitle2' component='span'>
            Average
          </Typography>
        </TableCell>
        <FooterCell
          value={
            <Typography variant='h6' component='span'>
              {formatPercentage(averageValues.weightedApy)}
            </Typography>
          }
          caption='Weighted'
        />
        <FooterCell
          value={
            <TokenAmount
              amount={formatAmount(formatEther(averageValues.investedAmount), {
                minValue: 100_000,
              })}
              symbol='USDC'
            />
          }
          caption='Per Tranche'
        />
        <FooterCell
          value={
            <TokenAmount
              amount={formatAmount(formatEther(averageValues.lastEpoch), {
                minValue: 100_000,
              })}
              symbol='USDC'
            />
          }
          caption='Per Pool'
        />
        <FooterCell
          value={
            <TokenAmount
              amount={formatAmount(formatEther(averageValues.lastMonth), {
                minValue: 100_000,
              })}
              symbol='USDC'
            />
          }
          caption='Per Pool'
        />
        <FooterCell
          value={
            <TokenAmount
              amount={formatAmount(formatEther(averageValues.lastYear), {
                minValue: 100_000,
              })}
              symbol='USDC'
            />
          }
          caption='Per Pool'
        />
        <FooterCell
          value={
            <TokenAmount
              amount={formatAmount(formatEther(averageValues.lifeTime), {
                minValue: 100_000,
              })}
              symbol='USDC'
            />
          }
          caption='Per Pool'
        />
      </TableRow>
      <TableRow
        sx={(theme) => ({
          background: alpha(theme.palette.primary.main, 0.08),
          '& .MuiTableCell-root': {
            py: '6px',
          },
        })}
      >
        <TableCell colSpan={2}>
          <Typography variant='subtitle2' component='span'>
            Total
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(totalValues.investedAmount), {
              minValue: 100_000,
            })}
            symbol='USDC'
            width='100%'
          />
        </TableCell>

        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(totalValues.lastEpoch), {
              minValue: 100_000,
            })}
            symbol='USDC'
            width='100%'
          />
        </TableCell>

        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(totalValues.lastMonth), {
              minValue: 100_000,
            })}
            symbol='USDC'
            width='100%'
          />
        </TableCell>

        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(totalValues.lastYear), {
              minValue: 100_000,
            })}
            symbol='USDC'
            width='100%'
          />
        </TableCell>

        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(totalValues.lifeTime), {
              minValue: 100_000,
            })}
            symbol='USDC'
            width='100%'
          />
        </TableCell>
      </TableRow>
    </>
  )
}

export default LendingPortfolioTableFooter
