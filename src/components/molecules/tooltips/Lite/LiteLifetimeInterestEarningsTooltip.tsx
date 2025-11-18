import { Stack, Typography } from '@mui/material'

const LiteLifetimeInterestEarningsTooltip = () => {
  return (
    <Stack spacing={2}>
      <Typography variant='inherit'>
        The total combined amount of interest you have earned (after fees) from
        all your lending on Kasu, since you first started lending.
      </Typography>
      <Typography variant='inherit'>
        This excludes any bonus yield (see Rewards Portfolio below for bonus
        yield).
      </Typography>
    </Stack>
  )
}

export default LiteLifetimeInterestEarningsTooltip
