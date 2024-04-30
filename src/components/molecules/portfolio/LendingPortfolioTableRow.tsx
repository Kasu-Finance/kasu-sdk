import LoginIcon from '@mui/icons-material/Login'
import {
  Badge,
  BadgeOwnProps,
  Box,
  Button,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'

import PoolAvatar from '@/components/atoms/PoolAvatar'
import LendingPortfolioTableCell from '@/components/molecules/portfolio/LendingPortfolioTableCell'
import { UserLendingPortfolio } from '@/components/organisms/portfolio/LendingPortfolioTable'

import { formatAmount, formatPercentage } from '@/utils'

type LendingPortfolioTableRowProps = {
  portfolio: UserLendingPortfolio
}

const LendingPortfolioTableRow: React.FC<LendingPortfolioTableRowProps> = ({
  portfolio,
}) => {
  const getBadgeColor = (
    status: UserLendingPortfolio['status']
  ): BadgeOwnProps['color'] => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'SUSPENDED':
        return 'warning'
      case 'CLOSED':
        return 'error'
    }
  }

  return (
    <>
      <TableRow sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
        <TableCell colSpan={7}>
          <Box display='flex' alignItems='center'>
            <Badge
              variant='dot'
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              color={getBadgeColor(portfolio.status)}
              overlap='circular'
            >
              <PoolAvatar name={portfolio.lendingPool.name} />
            </Badge>
            <Typography
              variant='subtitle1'
              component='span'
              display='block'
              ml={1}
            >
              {portfolio.lendingPool.name}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
      {portfolio.lendingPool.tranches.map((tranche, index) => (
        <TableRow
          sx={
            index === portfolio.lendingPool.tranches.length - 1
              ? {
                  '& .MuiTableCell-root': { border: 'none' },
                  '& .MuiDivider-root': { display: 'none' },
                }
              : undefined
          }
          key={index}
        >
          <TableCell sx={{ py: '6px' }}>{tranche.name}</TableCell>
          <TableCell sx={{ py: '6px', pr: 0 }} align='right'>
            {formatPercentage(tranche.apy)}
          </TableCell>
          <LendingPortfolioTableCell
            value={formatAmount(tranche.investedAmount, {
              minValue: 100_000,
            })}
          />
          <LendingPortfolioTableCell
            value={formatAmount(tranche.yieldEarnings.lastEpoch, {
              minValue: 100_000,
            })}
          />
          <LendingPortfolioTableCell
            value={formatAmount(tranche.yieldEarnings.lastMonth, {
              minValue: 100_000,
            })}
          />
          <LendingPortfolioTableCell
            value={formatAmount(tranche.yieldEarnings.lastYear, {
              minValue: 100_000,
            })}
          />
          <LendingPortfolioTableCell
            value={formatAmount(tranche.yieldEarnings.lifetime, {
              minValue: 100_000,
            })}
          />
        </TableRow>
      ))}
      <TableRow>
        <TableCell colSpan={7} sx={{ pt: '6px' }}>
          <Button
            sx={{ height: 30 }}
            variant='contained'
            startIcon={<LoginIcon />}
          >
            Deposit
          </Button>
        </TableCell>
      </TableRow>
    </>
  )
}

export default LendingPortfolioTableRow
