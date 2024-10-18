import { Box, Typography } from '@mui/material'
import { formatEther, formatUnits } from 'ethers/lib/utils'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useUserBalance from '@/hooks/web3/useUserBalance'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import NumericalInput from '@/components/molecules/NumericalInput'
import LendingLoyalityLevelsTooltip from '@/components/molecules/tooltips/LendingLoyalityLevelsTooltip'
import MinKsuLockLoyalityOne from '@/components/molecules/tooltips/MinKsuLockLoyalityOne'
import MinKsuLockLoyalityTwo from '@/components/molecules/tooltips/MinKsuLockLoyalityTwo'

import { KsuIcon } from '@/assets/icons'

import sdkConfig from '@/config/sdk'
import { customTypography } from '@/themes/typography'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LockModalInput = () => {
  const { t } = useTranslation()

  const { amount, setAmount } = useLockModalState()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const { balance: ksuBalance, decimals } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

  const { ksuPrice } = useKsuPrice()

  const balance = formatUnits(ksuBalance, decimals)

  const ksuInUSD = convertToUSD(
    toBigNumber(amount),
    toBigNumber(ksuPrice || '0')
  )

  const handleMax = () => {
    setAmount(balance)
    validate(balance)
  }

  const validate = (amount: string) => {
    if (amount && toBigNumber(amount).gt(toBigNumber(balance))) {
      setModalStatus({
        type: 'error',
        errorMessage: 'Insufficient balance',
      })
      return
    }

    if (toBigNumber(amount).isZero()) {
      setModalStatus({ type: 'error', errorMessage: 'Amount is required' })
      return
    }

    setModalStatus({ type: amount ? 'success' : 'default' })
  }

  const handleFocusState = (state: boolean) => {
    if (state) {
      setModalStatus({ type: 'focused' })
    } else {
      validate(amount)
    }
  }

  return (
    <Box>
      <NumericalInput
        amount={amount}
        label={t('modals.lock.deposit.input-label')}
        setAmount={setAmount}
        handleMax={handleMax}
        rootProps={{
          sx: {
            mt: 1,
            borderRadius: 30,
            bgcolor: 'gold.middle',

            '.MuiInputBase-root': {
              bgcolor: 'inherit',
            },
          },
          onFocus: () => handleFocusState(true),
          onBlur: () => handleFocusState(false),
          error: modalStatus.type === 'error',
          InputLabelProps: {
            shrink: true,
            sx: {
              ...customTypography.baseMd,
              color: 'white',
              ml: 1.3,
            },
          },
          InputProps: {
            startAdornment: <KsuIcon />,
            endAdornment: (
              <Typography
                whiteSpace='nowrap'
                variant='inherit'
                component='span'
                color='gold.extraDark'
              >
                ~ {formatAmount(formatEther(ksuInUSD), { minDecimals: 2 })} USDC
              </Typography>
            ),
            sx: {
              height: 48,
              borderRadius: 'inherit',

              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',

                legend: {
                  ...customTypography.baseMd,
                  fontSize: `calc(${customTypography.baseMd.fontSize}px * 0.75)`,
                  ml: 1.3,
                },
              },
              '& .MuiInputBase-input': {
                px: 1,
              },
            },
          },
        }}
        decimals={decimals}
      />
      <Typography
        variant='caption'
        component='span'
        color={(theme) => theme.palette.error.main}
        visibility={modalStatus.type === 'error' ? 'visible' : 'hidden'}
      >
        {modalStatus.type === 'error' ? modalStatus.errorMessage : 'message'}
      </Typography>
      <InfoRow
        title={t('modals.lock.deposit.amount-metric-1')}
        toolTipInfo={
          <ToolTip
            title={<MinKsuLockLoyalityOne />}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(500, { minDecimals: 2 })} KSU
          </Typography>
        }
      />
      <InfoRow
        title={t('modals.lock.deposit.amount-metric-2')}
        toolTipInfo={
          <ToolTip
            title={<MinKsuLockLoyalityTwo />}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(1000, { minDecimals: 2 })} KSU
          </Typography>
        }
      />
      <Typography variant='baseMd' mt={3} display='block'>
        {t('modals.lock.deposit.amount-metric-3')}{' '}
        <ToolTip
          title={<LendingLoyalityLevelsTooltip />}
          iconSx={{
            verticalAlign: 'sub',
            color: 'gold.extraDark',
            '&:hover': {
              color: 'rgba(133, 87, 38, 1)',
            },
          }}
        />{' '}
        {t('modals.lock.deposit.amount-metric-4')}
      </Typography>
    </Box>
  )
}

export default LockModalInput
