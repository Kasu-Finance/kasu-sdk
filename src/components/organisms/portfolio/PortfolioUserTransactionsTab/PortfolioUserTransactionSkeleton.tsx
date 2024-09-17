import { Box, Grid, Skeleton, Stack } from '@mui/material'

const PortfolioUserTransactionSkeleton = () => (
  <Box px={2}>
    <Grid container spacing={4}>
      <Grid item xs={3}>
        <Skeleton variant='rounded' sx={{ borderRadius: 30 }} height={56} />
      </Grid>
      <Grid item xs={3}>
        <Skeleton variant='rounded' sx={{ borderRadius: 30 }} height={56} />
      </Grid>
      <Grid item xs={3}>
        <Skeleton variant='rounded' sx={{ borderRadius: 30 }} height={56} />
      </Grid>
      <Grid item xs={3}>
        <Skeleton variant='rounded' sx={{ borderRadius: 30 }} height={56} />
      </Grid>
    </Grid>
    <Stack spacing={2} mt={4}>
      <Skeleton variant='rounded' height={60} />
      <Skeleton variant='rounded' height={40} />
      <Skeleton variant='rounded' height={40} />
      <Skeleton variant='rounded' height={40} />
      <Skeleton variant='rounded' height={40} />
    </Stack>
  </Box>
)
export default PortfolioUserTransactionSkeleton
