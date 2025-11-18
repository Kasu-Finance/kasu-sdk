import { Stack, Typography } from '@mui/material'

const LiteWeeklyInterestEarningsTooltip = () => {
  return (
    <Stack spacing={2}>
      <Typography variant='inherit'>
        The amount of interest (after fees) you are expected to earn for the
        current 7-day epoch, assuming no loan defaults.
      </Typography>
      <Typography variant='inherit'>
        This excludes any bonus yield (see Rewards Portfolio below for bonus
        yield).
      </Typography>
    </Stack>
  )
}

export default LiteWeeklyInterestEarningsTooltip
