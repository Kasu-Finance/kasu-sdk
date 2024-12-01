import { Box, Card, Grid, Skeleton, Stack } from '@mui/material'

const RepaymentsTabSkeleton = () => (
  <Card
    sx={{
      mt: 2,
    }}
  >
    <Skeleton variant='rectangular' height={80} />

    <Skeleton height={100} />
    <Stack alignItems='center' gap={2} mb={4}>
      <Skeleton width='50%' height={30} />
      <Skeleton variant='rounded' width={368} height={48} />
    </Stack>
    <Skeleton width='20%' height={40} />
    <Skeleton height={80} />
    <Grid container columnSpacing={4} mt={4}>
      <Grid item xs={6}>
        <Skeleton variant='rounded' height={116} />
      </Grid>
      <Grid item xs={6}>
        <Skeleton variant='rounded' height={116} />
      </Grid>
    </Grid>
    <Grid container columnSpacing={4} mt={4}>
      <Grid item xs={6}>
        <Box>
          <Skeleton height={80} />
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='30%' height={60} />
            <Skeleton width='15%' height={60} />
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='15%' height={60} />
            <Skeleton width='10%' height={60} />
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='20%' height={60} />
            <Skeleton width='20%' height={60} />
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='30%' height={60} />
            <Skeleton width='15%' height={60} />
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='30%' height={60} />
            <Skeleton width='15%' height={60} />
          </Box>
        </Box>
        <Box mt={7}>
          <Skeleton height={80} />
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='30%' height={60} />
            <Skeleton width='15%' height={60} />
          </Box>
        </Box>
      </Grid>
      <Grid item xs={6} display='flex' flexDirection='column'>
        <Box>
          <Skeleton height={80} />
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='30%' height={60} />
            <Skeleton width='15%' height={60} />
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='15%' height={60} />
            <Skeleton width='10%' height={60} />
          </Box>
        </Box>
        <Box mt='auto'>
          <Skeleton height={80} />
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='30%' height={60} />
            <Skeleton width='15%' height={60} />
          </Box>
          <Box display='flex' justifyContent='space-between'>
            <Skeleton width='30%' height={60} />
            <Skeleton width='15%' height={60} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Card>
)

export default RepaymentsTabSkeleton
