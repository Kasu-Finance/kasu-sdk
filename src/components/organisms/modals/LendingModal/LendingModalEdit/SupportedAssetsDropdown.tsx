import {
  Box,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useTranslation from '@/hooks/useTranslation'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import CustomSelect from '@/components/atoms/CustomSelect'

import OneInchLogo from '@/assets/logo/OneInchLogo'

import { SupportedTokens } from '@/constants/tokens'
import { capitalize, formatAmount } from '@/utils'

const SupportedAssetsDropdown = () => {
  const { t } = useTranslation()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  const { selectedToken, setSelectedToken } = useDepositModalState()

  const showOneInch = useMemo(
    () => selectedToken !== SupportedTokens.USDC,
    [selectedToken]
  )

  if (!supportedTokenUserBalances) {
    return (
      <Stack spacing={2}>
        <Skeleton sx={{ bgcolor: 'gold.extraDark' }} height={35} />
        <Skeleton
          sx={{ bgcolor: 'gold.extraDark' }}
          variant='rounded'
          height={56}
        />
      </Stack>
    )
  }

  const handleChange = (e: SelectChangeEvent) => {
    const symbol = e.target.value as SupportedTokens
    setSelectedToken(symbol)
  }

  return (
    <Stack spacing={2}>
      <Typography display='inline-flex' alignItems='center' gap={1}>
        {t('modals.earningsCalculator.simulatedAmount.metric-1')}{' '}
        {showOneInch && (
          <>
            {t('modals.earningsCalculator.simulatedAmount.metric-2')}
            <OneInchLogo />
          </>
        )}
      </Typography>
      <CustomSelect
        variant='secondary'
        label={capitalize(t('general.availableAssets'))}
        value={selectedToken}
        options={Object.values(supportedTokenUserBalances)}
        labelKey='symbol'
        valueKey='symbol'
        onChange={handleChange}
        renderSelected={(val) => {
          const { icon, symbol, decimals, balance } = val

          return (
            <Box display='flex' alignItems='center'>
              {icon.dark}
              <Typography
                variant='baseMd'
                mx={1}
                component='span'
                color='gold.extraDark'
              >
                {symbol}
              </Typography>
              <Typography component='span' variant='baseMd'>
                {formatAmount(formatUnits(balance, decimals), {
                  maxDecimals: 4,
                })}
              </Typography>
            </Box>
          )
        }}
        renderItem={(val) => {
          const { icon, symbol, decimals, balance, balanceInUSD } = val

          return (
            <Box display='flex' alignItems='center' py={1} width='100%'>
              {icon.light}
              <Typography
                variant='inherit'
                mx={1}
                component='span'
                color='gold.dark'
              >
                {symbol}
              </Typography>
              <Typography component='span' variant='inherit' color='white'>
                {formatAmount(formatUnits(balance, decimals), {
                  maxDecimals: 4,
                })}
              </Typography>
              <Typography
                variant='inherit'
                ml='auto'
                component='span'
                color='gold.dark'
              >
                USDC {symbol !== SupportedTokens.USDC && '~'}
                {formatAmount(formatUnits(balanceInUSD, decimals))}
              </Typography>
            </Box>
          )
        }}
      />
    </Stack>
  )
}

export default SupportedAssetsDropdown
