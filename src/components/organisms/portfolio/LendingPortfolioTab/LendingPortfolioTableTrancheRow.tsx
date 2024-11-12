import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Box,
  Button,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
} from '@mui/material'
import {
  PortfolioLendingPool,
  PortfolioTranche,
} from '@solidant/kasu-sdk/src/services/Portfolio/types'
import { UserTrancheBalance } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys, OpenModalParam } from '@/context/modal/modal.types'

import {
  FixApyIcon,
  FixRateIcon,
  PaperIcon,
  UploadMoneyIcon,
  WithdrawMoneyIcon,
} from '@/assets/icons'

import { TRANCHE_ICONS } from '@/constants/pool'
import { customTypography } from '@/themes/typography'
import { formatAmount, formatPercentage } from '@/utils'

type LendingPortfolioTableTrancheRowProps = {
  pool: PortfolioLendingPool
  currentEpoch: string
  tranche:
    | PortfolioTranche
    | (PortfolioTranche & { balanceData: UserTrancheBalance })
}

const LendingPortfolioTableTrancheRow: React.FC<
  LendingPortfolioTableTrancheRowProps
> = ({ tranche, pool, currentEpoch }) => {
  const { t } = getTranslation()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const { openModal } = useModalState()

  const { isLoading, nextEpochTime } = useNextEpochTime()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = <T extends ModalsKeys>(
    params: OpenModalParam<T>
  ) => {
    openModal(params)
    handleClose()
  }

  const unrequestedWithdrawalLoans = tranche.fixedLoans.filter(
    ({ isWithdrawalRequested }) => !isWithdrawalRequested
  )

  const autoConvertedLoans = unrequestedWithdrawalLoans.filter(
    ({ epochLockEnd }) =>
      parseFloat(currentEpoch) >
      parseFloat(epochLockEnd) - parseFloat(pool.requestEpochsInAdvance)
  )

  const unexpiredLoans = tranche.fixedLoans.filter(
    ({ epochLockEnd }) =>
      parseFloat(currentEpoch) <=
      parseFloat(epochLockEnd) - parseFloat(pool.requestEpochsInAdvance)
  )

  const isOpen = Boolean(anchorEl)

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          py: 0,
          ...customTypography.baseSm,
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
      <TableCell>{formatPercentage(tranche.apy).replaceAll(' ', '')}</TableCell>
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
            p: 0.5,

            '+ .MuiIconButton-root': {
              ml: 1,
            },
          },
        }}
      >
        <Box display='flex' alignItems='center' gap={2} height={26}>
          {unexpiredLoans.length ? (
            <Button
              variant='text'
              startIcon={<WithdrawMoneyIcon />}
              sx={{
                textTransform: 'unset',
                height: '100%',
                p: 0,
                ...customTypography.baseSm,
                '&.MuiButtonBase-root:focus::before': {
                  width: 'calc(100% + 24px)',
                  zIndex: 3,
                },
              }}
              onClick={() =>
                openModal({
                  name: ModalsKeys.WITHDRAW_FUNDS_AT_EXPIRY,
                  fixedLoans: unexpiredLoans,
                  pool,
                })
              }
            >
              {t('portfolio.lendingPortfolio.actions.action-1')}
            </Button>
          ) : null}
          <IconButton
            sx={{
              ml: 'auto',
              '&.MuiIconButton-root': { p: ' 0' },
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 10,
                height: 26,
                borderRadius: '0 0 8px 0',
                bgcolor: 'white',
                top: -2,
                right: 26,
                opacity: 1,
                zIndex: 1,
              },
            }}
            onClick={handleClick}
          >
            <Box
              sx={{
                position: 'relative',
                width: 24,
                height: 24,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: 26,
                  height: 26,
                  borderRadius: '8px 8px 0 0',
                  bgcolor: 'gray.extraDark',
                  top: -2,
                  right: 0,
                  opacity: isOpen ? 1 : 0,
                  transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  bgcolor: 'gray.extraDark',
                  top: 14,
                  right: 26,
                  opacity: isOpen ? 1 : 0,
                  transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1)',
                },
              }}
            >
              <MoreVertIcon color='primary' sx={{ position: 'relative' }} />
            </Box>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isOpen}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: 'gray.extraDark',
                  color: 'gold.dark',
                  borderRadius: '8px 0 8px 8px',
                  boxShadow: 'none',
                  width: 212,
                  '.MuiMenuItem-root': {
                    ...customTypography.baseSm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                },
              },
            }}
            TransitionComponent={Fade}
          >
            <MenuItem
              onClick={() =>
                handleMenuItemClick({
                  name: ModalsKeys.LEND,
                  pool,
                })
              }
            >
              <UploadMoneyIcon />
              {t('portfolio.lendingPortfolio.actions.action-2')}
            </MenuItem>
            {tranche.fixedTermConfig.length ? (
              <MenuItem
                onClick={() => {
                  if (!('balanceData' in tranche)) return

                  handleMenuItemClick({
                    name: ModalsKeys.FIX_APY,
                    pool: {
                      ...pool,
                      selectedTranche: tranche,
                    },
                    nextEpochTime,
                  })
                }}
                disabled={Boolean(!('balanceData' in tranche) || isLoading)}
              >
                <FixApyIcon />
                {t('portfolio.lendingPortfolio.actions.action-3')}
              </MenuItem>
            ) : null}
            {tranche.fixedLoans.length ? (
              <MenuItem
                onClick={() =>
                  handleMenuItemClick({
                    name: ModalsKeys.FIXED_LOAN,
                    fixedLoans: tranche.fixedLoans,
                  })
                }
              >
                <PaperIcon />
                {t('portfolio.lendingPortfolio.actions.action-4')}
              </MenuItem>
            ) : null}
            {autoConvertedLoans.length ? (
              <MenuItem
                onClick={() =>
                  handleMenuItemClick({
                    name: ModalsKeys.AUTO_CONVERSION_TO_VARIABLE,
                    epochNumber: pool.requestEpochsInAdvance,
                    fixedLoans: autoConvertedLoans,
                  })
                }
              >
                <FixRateIcon />
                {t('portfolio.lendingPortfolio.actions.action-5')}
              </MenuItem>
            ) : null}
          </Menu>
        </Box>
      </TableCell>
    </TableRow>
  )
}

export default LendingPortfolioTableTrancheRow
