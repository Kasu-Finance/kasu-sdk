import { Typography } from '@mui/material'

type TokenAmountProps = {
  amount: string
  symbol: string
}

const TokenAmount: React.FC<TokenAmountProps> = ({ amount, symbol }) => (
  <>
    <Typography variant='h6' component='span' display='inline-block'>
      {amount}
    </Typography>
    <Typography pl={0.5} variant='body1' component='span'>
      {symbol}
    </Typography>
  </>
)

export default TokenAmount
