import {
  Avatar,
  Box,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import Link from 'next/link'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'
import NextLink from '@/components/atoms/NextLink'
import TokenAmount from '@/components/atoms/TokenAmount'
import UnorderedList from '@/components/atoms/UnorderedList'
import PoolTableRowApy from '@/components/organisms/home/PoolTable/PoolTableRowApy'

import { Routes } from '@/config/routes'
import { TRANCHE_ICONS } from '@/constants/pool'
import { customTypography } from '@/themes/typography'
import { capitalize, formatAmount, formatPercentage } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'
import getInitials from '@/utils/getInitials'

import { PoolOverviewWithDelegate } from '@/types/page'

export type PoolTableRowProps = {
  pool: PoolOverviewWithDelegate
}

const PoolTableRow: React.FC<PoolTableRowProps> = ({ pool }) => {
  const { t } = getTranslation()

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
                textDecoration: 'none',
              }}
              component={Link}
              href={href}
            >
              {getInitials(pool.poolName)}
            </Avatar>
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
          {pool.tranches.map((tranche) => {
            const title = isMultiTranche
              ? `${tranche.name} ${t('general.tranche')} ${t('general.apy')}`
              : `${capitalize(t('general.lendingStrategy'))} ${t('general.apy')}`

            return (
              <PoolTableRowApy
                title={title}
                minApy={tranche.minApy}
                maxApy={tranche.maxApy}
                icon={
                  TRANCHE_ICONS[
                    tranche.name.toLowerCase() as keyof typeof TRANCHE_ICONS
                  ]
                }
                key={tranche.id}
              />
            )
          })}
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
            <UnorderedList sx={{ ...customTypography.baseSm, pl: 2 }}>
              {pool.security.map((security, index) => (
                <li key={index}>{security}</li>
              ))}
            </UnorderedList>
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}

export default PoolTableRow
