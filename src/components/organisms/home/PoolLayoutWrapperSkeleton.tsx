import { Box, Card, CardContent, Grid, Skeleton, Stack } from '@mui/material'

const CardSkeleton = () => (
  <Card sx={{ boxShadow: '0px 5px 20px 0px rgba(0, 0, 0, 0.1)' }}>
    <Stack justifyContent='space-between' height={344} p={2}>
      <Skeleton variant='rounded' width={20} height={20} />
      <Skeleton variant='rounded' width='100%' height='70%' />
      <Skeleton
        variant='rounded'
        width='100%'
        height={48}
        sx={{ mx: 'auto' }}
      />
    </Stack>
    <Box px={2} py={3}>
      <Skeleton height={30} />
      <Skeleton height={30} />
      <Skeleton height={30} />
    </Box>
    <CardContent>
      <Box display='flex' justifyContent='space-between'>
        <Skeleton width='60%' height={30} />
        <Skeleton width='30%' height={30} />
      </Box>
      <Box display='flex' justifyContent='space-between'>
        <Skeleton width='30%' height={30} />
        <Skeleton width='30%' height={30} />
      </Box>
      <Box display='flex' justifyContent='space-between'>
        <Skeleton width='30%' height={30} />
        <Skeleton width='20%' height={30} />
      </Box>
      <Skeleton width='25%' height={30} />
      <Skeleton width='100%' height={30} />
      <Skeleton width='20%' height={30} />
      <Skeleton width='100%' height={60} />
      <Box display='flex' gap={3} mt={3}>
        <Skeleton
          variant='rounded'
          height={48}
          sx={{ borderRadius: 30, flex: 1 }}
        />
        <Skeleton
          variant='rounded'
          height={48}
          sx={{ borderRadius: 30, flex: 1 }}
        />
      </Box>
    </CardContent>
  </Card>
)

const PoolLayoutWrapperSkeleton = () => {
  return (
    <Grid container item xs={12} spacing={3}>
      <Grid item xs={12} md={4}>
        <CardSkeleton />
      </Grid>
      <Grid item xs={12} md={4} display={{ xs: 'none', md: 'block' }}>
        <CardSkeleton />
      </Grid>
      <Grid item xs={12} md={4} display={{ xs: 'none', md: 'block' }}>
        <CardSkeleton />
      </Grid>
    </Grid>
  )
}
export default PoolLayoutWrapperSkeleton
