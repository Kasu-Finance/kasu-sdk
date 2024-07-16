import {
  Box,
  BoxProps,
  Skeleton,
  Typography,
  TypographyVariant,
} from '@mui/material'

type TokenAmountProps = BoxProps & {
  amount: string
  symbol: string
  amountVariant?: TypographyVariant
  symbolVariant?: TypographyVariant
  usdcVariant?: TypographyVariant
  usdValue?: string
  showSkeleton?: boolean
}

const TokenAmount: React.FC<TokenAmountProps> = ({
  amount,
  symbol,
  amountVariant,
  symbolVariant,
  usdcVariant,
  usdValue,
  showSkeleton,
  ...rest
}) => (
  <Box
    textAlign='right'
    width={showSkeleton ? 'auto' : 'max-content'}
    {...rest}
  >
    {showSkeleton ? (
      <Skeleton variant='rounded' height={32} />
    ) : (
      <>
        <Typography
          variant={amountVariant ?? 'h6'}
          component='span'
          display='inline-block'
          fontSize={{ xs: 20 }}
        >
          {amount}
        </Typography>
        <Typography
          pl={0.5}
          variant={symbolVariant ?? 'body1'}
          component='span'
          fontSize={{ xs: 12 }}
        >
          {symbol}
        </Typography>
      </>
    )}
    {usdValue &&
      (showSkeleton ? (
        <Skeleton />
      ) : (
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
      ))}
  </Box>
)

export default TokenAmount
