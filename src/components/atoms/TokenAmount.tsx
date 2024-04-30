import { Box, BoxProps, Typography, TypographyVariant } from '@mui/material'

type TokenAmountProps = BoxProps & {
  amount: string
  symbol: string
  amountVariant?: TypographyVariant
  symbolVariant?: TypographyVariant
  usdcVariant?: TypographyVariant
  usdValue?: string
}

const TokenAmount: React.FC<TokenAmountProps> = ({
  amount,
  symbol,
  amountVariant,
  symbolVariant,
  usdcVariant,
  usdValue,
  ...rest
}) => (
  <Box textAlign='right' width='max-content' {...rest}>
    <Typography
      variant={amountVariant ?? 'h6'}
      component='span'
      display='inline-block'
    >
      {amount}
    </Typography>
    <Typography pl={0.5} variant={symbolVariant ?? 'body1'} component='span'>
      {symbol}
    </Typography>
    {usdValue && (
      <Box color={(theme) => theme.palette.text.secondary}>
        <Typography
          variant={usdcVariant ?? 'body1'}
          component='span'
          display='inline-block'
        >
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
