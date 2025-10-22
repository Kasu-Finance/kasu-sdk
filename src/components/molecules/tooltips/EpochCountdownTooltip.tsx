import { Stack, Typography } from '@mui/material'

import OrderedList from '@/components/atoms/OrderedList'

const EpochCountdownTooltip = () => {
  return (
    <Stack spacing={2}>
      <Typography variant='baseXs'>
        Time remaining until the close of the current 7-day Epoch. At close, a
        48-hour Clearing Period begins. During this period:
      </Typography>
      <OrderedList
        sx={{
          pl: 1.5,
          'li + li': {
            mt: 1,
          },
        }}
      >
        <li>
          <Typography variant='baseXs'>
            <Typography variant='baseXsBold'>
              Lending Requests and Withdrawal Requests
            </Typography>{' '}
            are processed based on available capacity and liquidity. Unfilled
            Withdrawal Requests roll over to the next Epoch. Requests submitted
            after Epoch close are queued for the next Clearing Period.
          </Typography>
        </li>
        <li>
          <Typography variant='baseXs'>
            <Typography variant='baseXsBold'>Loan balances</Typography> are
            updated to reflect successful Transaction Requests.
          </Typography>
        </li>
        <li>
          <Typography variant='baseXs'>
            <Typography variant='baseXsBold'>Weekly interest</Typography> for
            the completed Epoch is calculated and credited to your balance(s).
          </Typography>
        </li>
      </OrderedList>
    </Stack>
  )
}

export default EpochCountdownTooltip
