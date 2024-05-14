import {
  Box,
  TableCell,
  TableCellProps,
  TableRow,
  Typography,
} from '@mui/material'
import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import { formatEther } from 'ethers/lib/utils'
import React, { ReactNode } from 'react'

import useCalculatePortfolioAverage from '@/hooks/lending/useCalculatePortfolioAverage'
import useCalculatePortfolioTotal from '@/hooks/lending/useCalculatePortfolioTotal'
import useTranslation from '@/hooks/useTranslation'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount, formatPercentage } from '@/utils'

type LendingPortfolioTableFooterProps = {
  lendingPortfolio: PortfolioLendingPool[]
}

type FooterCellProps = TableCellProps & {
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

  const { t } = useTranslation()

  return (
    <>
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            py: '6px',
          },
        }}
      >
        <TableCell>
          <Typography variant='subtitle2' component='span'>
            {t('general.average')}
          </Typography>
        </TableCell>
        <FooterCell
          value={
            <Typography variant='h6' component='span'>
              {formatPercentage(averageValues.weightedApy)}
            </Typography>
          }
          caption={t('general.weighted')}
          sx={{ pr: 0 }}
          className='apy'
        />
        <FooterCell
          value={
            <TokenAmount
              amount={formatAmount(
                formatEther(averageValues.investedAmount || '0'),
                {
                  minValue: 100_000,
                }
              )}
              symbol='USDC'
            />
          }
          caption={t('general.perTranche')}
        />
        <FooterCell
          value={
            <TokenAmount
              amount={formatAmount(
                formatEther(averageValues.lastEpoch || '0'),
                {
                  minValue: 100_000,
                }
              )}
              symbol='USDC'
            />
          }
          caption={t('general.perPool')}
        />
        <FooterCell
          value={
            <TokenAmount
              amount={formatAmount(formatEther(averageValues.lifeTime || '0'), {
                minValue: 100_000,
              })}
              symbol='USDC'
            />
          }
          caption={t('general.perPool')}
        />
      </TableRow>
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            py: '6px',
          },
        }}
      >
        <TableCell colSpan={2}>
          <Typography variant='subtitle2' component='span'>
            {t('general.total')}
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(
              formatEther(totalValues.investedAmount || '0'),
              {
                minValue: 100_000,
              }
            )}
            symbol='USDC'
            width='100%'
          />
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(totalValues.lastEpoch || '0'), {
              minValue: 100_000,
            })}
            symbol='USDC'
            width='100%'
          />
        </TableCell>
        <TableCell align='right'>
          <TokenAmount
            amount={formatAmount(formatEther(totalValues.lifeTime || '0'), {
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
