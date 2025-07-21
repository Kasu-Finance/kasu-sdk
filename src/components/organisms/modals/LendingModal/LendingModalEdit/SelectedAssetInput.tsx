import { Box, Skeleton, Typography } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import { Dispatch, SetStateAction } from 'react'
import { useChainId } from 'wagmi'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import DepositAmountInput from '@/components/molecules/lending/lendingModal/DepositAmountInput'

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
}

const SelectedAssetInput: React.FC<SelectedAssetInputProps> = ({
  selectedToken,
  amount,
  setAmount,
  amountInUSD,
  setAmountInUSD,
  isValidating,
  setIsValidating,
}) => {
  const chainId = useChainId()

  // const {
  //   // amountInUSD,

  //   isValidating,
  //   // setAmountInUSD,
  // } = useDepositModalState()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  const supportedTokens = useSupportedTokenInfo()

  if (!supportedTokenUserBalances || !supportedTokens) {
    return (
      <Skeleton
        variant='rounded'
        sx={{ bgcolor: 'gold.extraDark' }}
        height={60}
      />
    )
  }

  const usdcInfo = supportedTokens[SupportedTokens.USDC]

  const token = supportedTokens[selectedToken]

  const tokenBalance = supportedTokenUserBalances[selectedToken]

  return (
    <DepositAmountInput
      amount={amount}
      setAmount={setAmount}
      setAmountInUSD={setAmountInUSD}
      setIsValidating={setIsValidating}
      decimals={tokenBalance.decimals}
      balance={formatUnits(tokenBalance.balance, tokenBalance.decimals)}
      endAdornment={
        tokenBalance.symbol === SupportedTokens.USDC ? null : isValidating ? (
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
          {token.icon.dark}
          <Typography
            variant='inherit'
            component='span'
            color='gold.extraDark'
            ml={1}
          >
            {tokenBalance.symbol}
          </Typography>
        </Box>
      }
      applyConversion={
        selectedToken === SupportedTokens.USDC
          ? undefined
          : {
              chainId,
              fromToken: {
                address: tokenBalance.address,
                decimals: tokenBalance.decimals,
              },
              toToken: {
                address: usdcInfo.address,
                decimals: usdcInfo.decimals,
              },
            }
      }
      debounceTime={500}
    />
  )
}

export default SelectedAssetInput
