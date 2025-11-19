import {
  Box,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import React, { memo } from 'react'

import getTranslation from '@/hooks/useTranslation'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import CustomSelect from '@/components/atoms/CustomSelect'

import { SupportedTokens } from '@/constants/tokens'
import { capitalize, formatAmount } from '@/utils'

type SupportedAssetsDropdownProps = {
  selectedToken: SupportedTokens
  setSelectedToken: (token: SupportedTokens) => void
}

const SupportedAssetsDropdown: React.FC<SupportedAssetsDropdownProps> = ({
  selectedToken,
  setSelectedToken,
}) => {
  const { t } = getTranslation()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

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
    <CustomSelect
      variant='secondary'
      label={capitalize(t('general.availableAssets'))}
      value={selectedToken}
      options={Object.values(supportedTokenUserBalances)}
      labelKey='symbol'
      valueKey='symbol'
      onChange={handleChange}
      renderSelected={(val) => {
        if (!val) return null

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
  )
}

export default memo(SupportedAssetsDropdown)
