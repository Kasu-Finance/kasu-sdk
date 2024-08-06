import {
  Box,
  BoxProps,
  Skeleton,
  Typography,
  TypographyProps,
} from '@mui/material'

type TokenAmountProps = BoxProps & {
  amount: string
  symbol: string
  amountProps?: TypographyProps
  symbolProps?: TypographyProps
  usdcProps?: TypographyProps
  usdValue?: string
  showSkeleton?: boolean
}

const TokenAmount: React.FC<TokenAmountProps> = ({
  amount,
  symbol,
  amountProps,
  symbolProps,
  usdcProps,
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
      <div>
        <Typography
          variant="h6"
          component='span'
          display='inline-block'
          color='primary.main'
          {...amountProps}
        >
          {amount}
        </Typography>
        <Typography pl={1} variant="body1" component='span' {...symbolProps}>
          {symbol}
        </Typography>
      </div>
    )}
    {usdValue &&
      (showSkeleton ? (
        <Skeleton />
      ) : (
        <Box color={(theme) => theme.palette.text.secondary}>
          <Typography
            variant="body1"
            component='span'
            display='inline-block'
            {...usdcProps}
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
