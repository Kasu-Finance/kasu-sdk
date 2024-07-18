import { Badge, Box, TableCell, TableRow, Typography } from '@mui/material'
import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import PoolAvatar from '@/components/atoms/PoolAvatar'

import { formatAmount, formatPercentage } from '@/utils'

type LendingPortfolioTableRowProps = {
  portfolio: PortfolioLendingPool
}

const LendingPortfolioMobileTableRow: React.FC<
  LendingPortfolioTableRowProps
> = ({ portfolio }) => {
  const { t } = useTranslation()

  return (
    <>
      <TableRow sx={{ '& .MuiTableCell-root': { border: 'none', px: 0 } }}>
        <TableCell colSpan={7}>
          <Box display='flex' alignItems='center' mb={2}>
            <Badge
              variant='dot'
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              color={portfolio.isActive ? 'success' : 'error'}
              overlap='circular'
            >
              <PoolAvatar
                sx={{ width: 32, height: 32 }}
                name={portfolio.name}
              />
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
          {portfolio.tranches.map((tranche, index) => (
            <Box key={index} mt={1}>
              {portfolio.tranches.length >= 0 && (
                <Typography variant='h6' component='span'>
                  {tranche.name}
                </Typography>
              )}
              <InfoRow
                title={t('general.apy')}
                titleStyle={{ fontSize: 12 }}
                showDivider
                sx={{ px: 0 }}
                metric={
                  <Typography variant='body2'>
                    {formatPercentage(tranche.apy)}
                  </Typography>
                }
              />
              <InfoRow
                title={t('portfolio.lendingPortfolio.lendingBalance')}
                titleStyle={{ fontSize: 12 }}
                showDivider
                sx={{ px: 0 }}
                metric={
                  <Typography variant='body2'>
                    {formatAmount(tranche.investedAmount || '0', {
                      minValue: 100_000,
                    })}
                  </Typography>
                }
              />
              <InfoRow
                title={t(
                  'portfolio.lendingPortfolio.interestEarningsClaimable'
                )}
                titleStyle={{ fontSize: 12 }}
                showDivider
                sx={{ px: 0 }}
                metric={
                  <Typography variant='body2'>
                    {formatAmount(tranche.yieldEarnings.lastEpoch || '0', {
                      minValue: 100_000,
                    })}
                  </Typography>
                }
              />
              <InfoRow
                title={t('portfolio.lendingPortfolio.interestEarningsLifetime')}
                titleStyle={{ fontSize: 12 }}
                sx={{ px: 0 }}
                metric={
                  <Typography variant='body2'>
                    {formatAmount(tranche.yieldEarnings.lifetime || '0', {
                      minValue: 100_000,
                    })}
                  </Typography>
                }
              />
            </Box>
          ))}
        </TableCell>
      </TableRow>
      {/* {portfolio.tranches.map((tranche, index) => (
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
            <Typography variant='caption' textTransform='capitalize'>
              {portfolio.tranches.length > 1
                ? tranche.name
                : t('general.lendingStrategy')}
            </Typography>
          </TableCell>
          <TableCell sx={{ py: '6px', pr: 0 }} align='right' width='17%'>
            <Typography variant='body1'>
              {formatPercentage(tranche.apy)}
            </Typography>
          </TableCell>
          <LendingPortfolioTableCell
            value={formatAmount(tranche.investedAmount || '0', {
              minValue: 100_000,
            })}
            width='17%'
          />
          <LendingPortfolioTableCell
            value={formatAmount(tranche.yieldEarnings.lastEpoch || '0', {
              minValue: 100_000,
            })}
            width='24%'
          />

          <LendingPortfolioTableCell
            value={formatAmount(tranche.yieldEarnings.lifetime || '0', {
              minValue: 100_000,
            })}
            width='24%'
          />
        </TableRow>
      ))} */}
    </>
  )
}

export default LendingPortfolioMobileTableRow
