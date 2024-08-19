import {
  Box,
  BoxProps,
  Skeleton,
  Typography,
  TypographyProps,
} from '@mui/material'

export type TokenAmountProps = BoxProps & {
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
      <Box>
        <Typography
          variant='h4'
          component='span'
          display='inline-block'
          color='primary.main'
          {...amountProps}
        >
          {amount}
        </Typography>
        <Typography pl={1} variant='baseMd' component='span' {...symbolProps}>
          {symbol}
        </Typography>
      </Box>
    )}
    {usdValue &&
      (showSkeleton ? (
        <Skeleton />
      ) : (
        <Box color={(theme) => theme.palette.text.secondary}>
          <Typography
            variant='body1'
            component='span'
            display='inline-block'
            {...usdcProps}
          >
            {usdValue}
          </Typography>
          <Typography variant='caption' component='span'>
            {' '}
            USDC
          </Typography>
        </Box>
      ))}
  </Box>
)

export default TokenAmount
