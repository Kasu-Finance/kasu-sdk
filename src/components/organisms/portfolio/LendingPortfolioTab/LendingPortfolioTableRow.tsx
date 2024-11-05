import { Box, IconButton, TableCell, TableRow, Typography } from '@mui/material'
import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'
import NextLink from '@/components/atoms/NextLink'

import {
  FixApyIcon,
  FixRateIcon,
  PaperIcon,
  UploadMoneyIcon,
  WithdrawMoneyIcon,
} from '@/assets/icons'

import { Routes } from '@/config/routes'
import { TRANCHE_ICONS } from '@/constants/pool'
import { formatAmount, formatPercentage } from '@/utils'

type LendingPortfolioTableRowProps = {
  portfolioPool: PortfolioLendingPool
}

const LendingPortfolioTableRow: React.FC<LendingPortfolioTableRowProps> = ({
  portfolioPool,
}) => {
  const { t } = getTranslation()

  return (
    <>
      <TableRow>
        <TableCell colSpan={7} sx={{ pt: 4 }}>
          <Typography
            variant='baseMdBold'
            color='gold.dark'
            whiteSpace='normal'
            component={NextLink}
            href={`${Routes.lending.root.url}/${portfolioPool.id}`}
          >
            {portfolioPool.name}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ pt: 0 }} colSpan={7}>
          <DottedDivider />
        </TableCell>
      </TableRow>
      {portfolioPool.tranches.map((tranche) => (
        <TableRow
          key={tranche.name}
          sx={{
            '.MuiTableCell-root': {
              py: 0.5,
            },
          }}
        >
          <TableCell>
            <Box display='flex' alignItems='center' gap={1}>
              {
                TRANCHE_ICONS[
                  tranche.name.toLowerCase() as keyof typeof TRANCHE_ICONS
                ]
              }
              {tranche.name} {t('general.tranche')}
            </Box>
          </TableCell>
          <TableCell>
            {formatPercentage(tranche.apy).replaceAll(' ', '')}
          </TableCell>
          <TableCell>
            {tranche.fixedTermConfig.length ? 'Fixed' : 'Variable'}
          </TableCell>
          <TableCell>
            {formatAmount(tranche.investedAmount || '0', {
              minValue: 10_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
          </TableCell>
          <TableCell>
            {formatAmount(tranche.yieldEarnings.lastEpoch || '0', {
              minValue: 10_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
          </TableCell>
          <TableCell>
            {formatAmount(tranche.yieldEarnings.lifetime || '0', {
              minValue: 10_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
          </TableCell>
          <TableCell
            sx={{
              '.MuiIconButton-root': {
                p: 0,

                '+ .MuiIconButton-root': {
                  ml: 1,
                },
              },
            }}
          >
            <IconButton>
              <PaperIcon />
            </IconButton>
            <IconButton>
              <FixApyIcon />
            </IconButton>
            <IconButton>
              <UploadMoneyIcon />
            </IconButton>
            <IconButton>
              <WithdrawMoneyIcon />
            </IconButton>
            <IconButton>
              <FixRateIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default LendingPortfolioTableRow
