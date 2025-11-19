import { Box, Skeleton, Typography } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import { Dispatch, SetStateAction } from 'react'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import { SupportedTokenUserBalances } from '@/hooks/web3/useSupportedTokenUserBalances'

import BuyAmountInput from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/BuyAmountInput'

import { SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'

type SelectedAssetInputProps = {
  selectedToken: SupportedTokens
  amount: string
  setAmount: Dispatch<SetStateAction<string>>
  amountInUSD: string | undefined
  setAmountInUSD: Dispatch<SetStateAction<string | undefined>>
  isValidating: boolean
  setIsValidating: Dispatch<SetStateAction<boolean>>
  validate: (amount: string, amountInUSD?: string) => void
  supportedTokenUserBalances: Record<
    SupportedTokens,
    SupportedTokenUserBalances
  >
  supportedTokens: NonNullable<ReturnType<typeof useSupportedTokenInfo>>
  applyConversion: (fromAmount: string, token: SupportedTokens) => void
}

const SelectedAssetInput: React.FC<SelectedAssetInputProps> = ({
  selectedToken,
  amount,
  setAmount,
  amountInUSD,
  setAmountInUSD,
  isValidating,
  setIsValidating,
  validate,
  supportedTokenUserBalances,
  supportedTokens,
  applyConversion,
}) => {
  const usdcInfo = supportedTokens[SupportedTokens.USDC]

  const targetToken = supportedTokens[selectedToken]

  const targetTokenBalance = supportedTokenUserBalances[selectedToken]

  return (
    <BuyAmountInput
      selectedToken={selectedToken}
      amount={amount}
      amountInUSD={amountInUSD}
      validate={validate}
      setAmount={setAmount}
      setAmountInUSD={setAmountInUSD}
      setIsValidating={setIsValidating}
      decimals={targetTokenBalance.decimals}
      balance={formatUnits(
        targetTokenBalance.balance,
        targetTokenBalance.decimals
      )}
      endAdornment={
        targetTokenBalance.symbol ===
        SupportedTokens.USDC ? null : isValidating ? (
          <Skeleton
            variant='rounded'
            sx={{ bgcolor: 'gold.extraDark' }}
            width={100}
            height={30}
          />
        ) : (
          <Typography
            whiteSpace='nowrap'
            variant='inherit'
            component='span'
            color='gold.extraDark'
          >
            {usdcInfo.symbol} ~
            {formatAmount(amountInUSD || 0, { maxDecimals: 4 })}
          </Typography>
        )
      }
      startAdornment={
        <Box display='flex' alignItems='center'>
          {targetToken.icon.dark}
          <Typography
            variant='inherit'
            component='span'
            color='gold.extraDark'
            ml={1}
          >
            {targetTokenBalance.symbol}
          </Typography>
        </Box>
      }
      applyConversion={applyConversion}
      debounceTime={500}
    />
  )
}

export default SelectedAssetInput
