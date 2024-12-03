import { Box, Grid, Skeleton } from '@mui/material'

const UserLendingTrancheDetailSkeleton = () => (
  <Grid container spacing={4} mt={2}>
    <Grid item flex={1}>
      <Skeleton variant='rounded' height={57} />
      <Box display='flex' justifyContent='space-between' mt={1} mb={1}>
        <Skeleton variant='rounded' width={80} height={45} />
        <Skeleton variant='rounded' width={60} height={45} />
      </Box>
      <Box display='flex' justifyContent='space-between' mb={1}>
        <Skeleton variant='rounded' width={120} height={32} />
        <Skeleton variant='rounded' width={120} height={32} />
      </Box>
      <Box display='flex' justifyContent='space-between' mb={1}>
        <Skeleton variant='rounded' width={100} height={32} />
        <Skeleton variant='rounded' width={90} height={32} />
      </Box>
      <Box display='flex' justifyContent='space-between'>
        <Skeleton variant='rounded' width={140} height={32} />
        <Skeleton variant='rounded' width={110} height={32} />
      </Box>
    </Grid>
    <Grid item flex={1}>
      <Skeleton variant='rounded' height={57} />
      <Box display='flex' justifyContent='space-between' mt={1} mb={1}>
        <Skeleton variant='rounded' width={80} height={45} />
        <Skeleton variant='rounded' width={60} height={45} />
      </Box>
      <Box display='flex' justifyContent='space-between' mb={1}>
        <Skeleton variant='rounded' width={120} height={32} />
        <Skeleton variant='rounded' width={120} height={32} />
      </Box>
      <Box display='flex' justifyContent='space-between' mb={1}>
        <Skeleton variant='rounded' width={100} height={32} />
        <Skeleton variant='rounded' width={90} height={32} />
      </Box>
      <Box display='flex' justifyContent='space-between'>
        <Skeleton variant='rounded' width={140} height={32} />
        <Skeleton variant='rounded' width={110} height={32} />
      </Box>
    </Grid>
  </Grid>
)

export default UserLendingTrancheDetailSkeleton
