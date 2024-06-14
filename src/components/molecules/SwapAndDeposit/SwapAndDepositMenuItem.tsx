import { Typography } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'

import { SupportedTokenUserBalances } from '@/hooks/web3/useSupportedTokenUserBalances'

import { SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'

type SwapAndDepositMenuItemProps = {
  showEstimatedPrice?: boolean
  val: SupportedTokenUserBalances
}

const SwapAndDepositMenuItem: React.FC<SwapAndDepositMenuItemProps> = ({
  val,
  showEstimatedPrice = false,
}) => {
  const { icon, symbol, decimals, balance, balanceInUSD } = val

  return (
    <>
      {icon}
      <Typography
        variant='inherit'
        mx={1}
        component='span'
        color={(theme) => theme.palette.text.disabled}
      >
        {symbol}
      </Typography>
      <Typography component='span' variant='inherit'>
        {formatAmount(formatUnits(balance, decimals), { maxDecimals: 4 })}
      </Typography>
      {showEstimatedPrice && (
        <Typography
          variant='inherit'
          ml='auto'
          component='span'
          color={(theme) => theme.palette.text.disabled}
        >
          USDC {symbol !== SupportedTokens.USDC && '~'}
          {formatAmount(formatUnits(balanceInUSD, decimals))}
        </Typography>
      )}
    </>
  )
}

export default SwapAndDepositMenuItem
