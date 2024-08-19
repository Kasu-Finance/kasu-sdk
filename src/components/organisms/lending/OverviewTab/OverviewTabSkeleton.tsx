import { Box, Card, Grid, Skeleton } from '@mui/material'

const OverviewTabSkeleton = () => (
  <Card sx={{ mt: 2 }}>
    <Skeleton variant='rectangular' height={80} />
    <Skeleton height={60} width='90%' />
    <Skeleton height={30} width='80%' />
    <Grid container gap={4} mt={2}>
      <Grid item flex={1}>
        <Skeleton variant='rounded' height={116} />
      </Grid>
      <Grid item flex={1}>
        <Skeleton variant='rounded' height={116} />
      </Grid>
      <Grid item flex={1}>
        <Skeleton variant='rounded' height={116} />
      </Grid>
      <Grid item flex={1}>
        <Skeleton variant='rounded' height={116} />
      </Grid>
    </Grid>
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
      <Grid item flex={1} rowSpacing={1}>
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
    <Grid container columnSpacing={4} rowSpacing={2} mt={6}>
      <Grid item xs={12}>
        <Skeleton variant='rounded' height={57} width='40%' />
      </Grid>
      <Grid item flex={1}>
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
      <Grid item flex={1} rowSpacing={1}>
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
    <Box display='flex' justifyContent='center' mt={4}>
      <Skeleton
        variant='rounded'
        width={368}
        height={48}
        sx={{ borderRadius: 30 }}
      />
    </Box>
  </Card>
)

export default OverviewTabSkeleton
