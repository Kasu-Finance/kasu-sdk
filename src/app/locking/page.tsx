import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'

import BalanceOverview from '@/components/molecules/locking/BalanceOverview'
import EpochOverview from '@/components/molecules/locking/EpochOverview'
import LoyaltyOverview from '@/components/molecules/locking/LoyaltyOverview'
import RewardsOverview from '@/components/molecules/locking/RewardsOverview'
import UnlockOverview from '@/components/molecules/locking/UnlockOverview'
import PageHeader from '@/components/molecules/PageHeader'

const Locking = async () => {
  return (
    <Container maxWidth='lg'>
      <PageHeader title='Locking' />
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          <BalanceOverview />
          <UnlockOverview />
          <RewardsOverview />
        </Grid>
        <Grid item xs={12} md={6}>
          <LoyaltyOverview />
          <EpochOverview />
        </Grid>
      </Grid>
    </Container>
  )
}

export default Locking
