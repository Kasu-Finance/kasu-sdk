import { Grid } from '@mui/material'

import PoolCardSkeleton from '@/components/molecules/loaders/PoolCardSkeleton'

const PoolCardWrapperSkeleton = () => {
  return (
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
  )
}
export default PoolCardWrapperSkeleton
