import {
  Avatar,
  Box,
  Divider,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import Link from 'next/link'

import useTranslation from '@/hooks/useTranslation'

import NextLink from '@/components/atoms/NextLink'
import TokenAmount from '@/components/atoms/TokenAmount'
import PoolTableRowApy from '@/components/organisms/home/PoolTable/PoolTableRowApy'

import { BriefcaseIcon, MoneyIcon, PouchIcon, WalletIcon } from '@/assets/icons'

import { Routes } from '@/config/routes'
import { capitalize, formatAmount, formatPercentage } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'

import { PoolOverviewWithDelegate } from '@/types/page'

export type PoolTableRowProps = {
  pool: PoolOverviewWithDelegate
}

const TRANCHE_ICONS = {
  senior: <PouchIcon />,
  mezzanine: <BriefcaseIcon />,
  junior: <WalletIcon />,
}

const PoolTableRow: React.FC<PoolTableRowProps> = ({ pool }) => {
  const { t } = useTranslation()

  const isActivePool = pool.isActive

  const isMultiTranche = pool.tranches.length > 1

  const href = `${Routes.lending.root.url}/${pool.id}`

  return (
    <>
      <TableRow>
        <TableCell
          sx={{
            '&:not(:last-child)': {
              pr: 0,
            },
          }}
        >
          <Box display='flex' alignItems='center' gap={2}>
            <Avatar
              src={pool.thumbnailImageUrl}
              variant='circular'
              alt={pool.poolName}
              sx={{
                width: 80,
                height: 80,
                objectFit: 'contain',
                bgcolor: 'gray.extraDark',
              }}
              component={Link}
              href={href}
            />
            <Stack>
              <Typography
                variant='baseMdBold'
                color='gold.dark'
                whiteSpace='normal'
                component={NextLink}
                href={href}
              >
                {pool.poolName}
              </Typography>
              <Typography
                variant='baseSmBold'
                color='gray.dark'
                whiteSpace='normal'
                mt={0.5}
              >
                {t('details.poolDetails.assetClass.label')}:{' '}
                <Typography variant='baseSm' component='span'>
                  {pool.assetClass}
                </Typography>
              </Typography>
            </Stack>
          </Box>
        </TableCell>
        <TableCell>
          {isMultiTranche ? (
            pool.tranches.map((tranche) => (
              <PoolTableRowApy
                title={`${tranche.name} ${t('general.tranche')} ${t('general.apy')}`}
                apy={formatPercentage(tranche.apy).replaceAll(' ', '')}
                icon={
                  TRANCHE_ICONS[
                    tranche.name.toLowerCase() as keyof typeof TRANCHE_ICONS
                  ]
                }
                key={tranche.id}
              />
            ))
          ) : (
            <PoolTableRowApy
              title={`${capitalize(t('general.lendingStrategy'))} ${t('general.apy')}`}
              apy={formatPercentage(pool.apy).replaceAll(' ', '')}
              icon={<MoneyIcon />}
            />
          )}
        </TableCell>
        {!isActivePool && (
          <TableCell>
            <TokenAmount
              amount={formatAmount(pool.loansUnderManagement || '0', {
                minValue: 1_000_000,
              })}
              symbol='USDC'
              amountProps={{
                variant: 'baseSm',
                color: 'gray.extraDark',
              }}
              symbolProps={{ variant: 'baseSm' }}
            />
          </TableCell>
        )}
        <TableCell>
          <TokenAmount
            amount={formatAmount(
              pool.delegate.totalLoanFundsOriginated || '0',
              {
                minValue: 1_000_000,
              }
            )}
            symbol='USDC'
            amountProps={{
              variant: 'baseSm',
              color: 'gray.extraDark',
            }}
            symbolProps={{ variant: 'baseSm' }}
          />
        </TableCell>
        {isActivePool && (
          <TableCell>
            <Typography variant='baseSm'>
              {formatDuration(pool.delegate.delegateLendingHistory, {
                years: true,
                months: true,
              })}
            </Typography>
          </TableCell>
        )}
        <TableCell>
          <Typography variant='baseSm'>
            {formatPercentage(pool.delegate.historicLossRate).replaceAll(
              ' ',
              ''
            )}
          </Typography>
        </TableCell>
        {isActivePool && (
          <TableCell>
            <Typography variant='baseSm' whiteSpace='normal'>
              {pool.security}
            </Typography>
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <Divider variant='dotted' />
        </TableCell>
      </TableRow>
    </>
  )
}

export default PoolTableRow
