import { Container, Grid } from '@mui/material'

import BalanceOverview from '@/components/molecules/locking/BalanceOverview'
import LoyaltyOverview from '@/components/molecules/locking/LoyaltyOverview'
import RewardsBreakdown from '@/components/molecules/locking/RewardsBreakdown'
import RewardSummary from '@/components/molecules/locking/RewardSummary'
import UnlockOverview from '@/components/molecules/locking/UnlockOverview'
import PageHeader from '@/components/molecules/PageHeader'

const Locking = async () => {
  return (
    <Container maxWidth='lg'>
      <PageHeader title='Locking' />
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          <BalanceOverview />
          <RewardSummary />
        </Grid>
        <Grid item xs={12} md={6}>
          <LoyaltyOverview />
        </Grid>
        <Grid item xs={12}>
          <RewardsBreakdown />
          <UnlockOverview />
        </Grid>
      </Grid>
    </Container>
  )
}

export default Locking
