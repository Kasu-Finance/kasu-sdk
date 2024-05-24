import { Container, Grid } from '@mui/material'

import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'
import PoolCardSkeleton from '@/components/molecules/loaders/PoolCardSkeleton'
import TabsSkeleton from '@/components/molecules/loaders/TabsSkeleton'

const LendingSkeleton: React.FC = () => {
  return (
    <Container maxWidth='lg'>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CardSkeleton leftRowNumbers={1} rightRowNumbers={1} />
        </Grid>
        <Grid item xs={12}>
          <TabsSkeleton numTabs={2} />
        </Grid>
        <Grid container item xs={12} spacing={2}>
          <Grid item xs={12} md={4}>
            <PoolCardSkeleton />
          </Grid>
          <Grid item xs={12} md={4} display={{ xs: 'none', md: 'block' }}>
            <PoolCardSkeleton />
          </Grid>
          <Grid item xs={12} md={4} display={{ xs: 'none', md: 'block' }}>
            <PoolCardSkeleton />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}

export default LendingSkeleton
