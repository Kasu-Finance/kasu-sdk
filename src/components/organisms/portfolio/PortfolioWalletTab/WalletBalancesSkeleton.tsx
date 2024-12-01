import { Grid, Skeleton } from '@mui/material'

const WalletBalancesSkeleton = () => (
  <>
    <Grid container columnSpacing={4} rowSpacing={2} mt={1}>
      <Grid item xs={6}>
        <Skeleton variant='rounded' height={60} />
      </Grid>
      <Grid item xs={6}>
        <Skeleton variant='rounded' height={60} />
      </Grid>
      <Grid item xs={6}>
        <Skeleton variant='rounded' height={60} />
      </Grid>
      <Grid item xs={6}>
        <Skeleton variant='rounded' height={60} />
      </Grid>
      <Grid item xs={6}>
        <Skeleton variant='rounded' height={60} />
      </Grid>
      <Grid item xs={6}>
        <Skeleton variant='rounded' height={60} />
      </Grid>
      <Grid item xs={12} display='flex' justifyContent='center' mt={4}>
        <Skeleton
          variant='rounded'
          width={368}
          height={48}
          sx={{ borderRadius: 30 }}
        />
      </Grid>
    </Grid>
  </>
)

export default WalletBalancesSkeleton
