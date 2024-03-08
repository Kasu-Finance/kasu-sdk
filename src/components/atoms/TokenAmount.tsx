import { Box, BoxProps, Typography } from '@mui/material'

type TokenAmountProps = BoxProps & {
  amount: string
  symbol: string
  usdValue?: string
}

const TokenAmount: React.FC<TokenAmountProps> = ({
  amount,
  symbol,
  usdValue,
  ...rest
}) => (
  <Box textAlign='right' width='max-content' {...rest}>
    <Typography variant='h6' component='span' display='inline-block'>
      {amount}
    </Typography>
    <Typography pl={0.5} variant='body1' component='span'>
      {symbol}
    </Typography>
    {usdValue && (
      <Box>
        <Typography variant='body1' component='span' display='inline-block'>
          {usdValue}
        </Typography>
        <Typography pl={0.5} variant='caption' component='span'>
          USDC
        </Typography>
      </Box>
    )}
  </Box>
)

export default TokenAmount
