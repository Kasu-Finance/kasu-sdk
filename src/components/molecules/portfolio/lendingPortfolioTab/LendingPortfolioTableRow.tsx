import { Badge, Box, TableCell, TableRow, Typography } from '@mui/material'
import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import React from 'react'

import PoolAvatar from '@/components/atoms/PoolAvatar'
import LendingPortfolioTableCell from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioTableCell'

import { formatAmount, formatPercentage } from '@/utils'

type LendingPortfolioTableRowProps = {
  portfolio: PortfolioLendingPool
}

const LendingPortfolioTableRow: React.FC<LendingPortfolioTableRowProps> = ({
  portfolio,
}) => {
  return (
    <>
      <TableRow sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
        <TableCell colSpan={7}>
          <Box display='flex' alignItems='center'>
            <Badge
              variant='dot'
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              color={portfolio.isActive ? 'success' : 'error'}
              overlap='circular'
            >
              <PoolAvatar name={portfolio.name} />
            </Badge>
            <Typography
              variant='subtitle1'
              component='span'
              display='block'
              ml={1}
            >
              {portfolio.name}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
      {portfolio.tranches.map((tranche, index) => (
        <TableRow
          sx={
            index === portfolio.tranches.length - 1
              ? {
                  '& .MuiTableCell-root': { border: 'none', pb: 2 },
                  '& .MuiDivider-root': { display: 'none' },
                }
              : undefined
          }
          key={index}
        >
          <TableCell sx={{ py: '6px' }} width='17%'>
            <Typography variant='caption'>
              {portfolio.tranches.length > 1 ? tranche.name : 'Lending Pool'}
            </Typography>
          </TableCell>
          <TableCell sx={{ py: '6px', pr: 0 }} align='right' width='17%'>
            <Typography variant='body1'>
              {formatPercentage(tranche.apy)}
            </Typography>
          </TableCell>
          <LendingPortfolioTableCell
            value={formatAmount(tranche.investedAmount, {
              minValue: 100_000,
            })}
            width='17%'
          />
          <LendingPortfolioTableCell
            value={formatAmount(tranche.yieldEarnings.lastEpoch, {
              minValue: 100_000,
            })}
            width='24%'
          />

          <LendingPortfolioTableCell
            value={formatAmount(tranche.yieldEarnings.lifetime, {
              minValue: 100_000,
            })}
            width='24%'
          />
        </TableRow>
      ))}
    </>
  )
}

export default LendingPortfolioTableRow
