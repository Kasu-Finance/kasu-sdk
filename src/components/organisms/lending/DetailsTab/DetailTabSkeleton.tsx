import { Card, CardContent, Grid, Skeleton, Stack } from '@mui/material'

const DetailTabSkeleton = () => (
  <Stack spacing={3} mt={3}>
    <Card>
      <Skeleton variant='rectangular' height={80} />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={116} />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={116} />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={116} />
          </Grid>
        </Grid>
        <Grid container columnSpacing={4} rowSpacing={2} mt={5}>
          <Grid item sm={6}>
            <Skeleton width='20%' />
            <Skeleton width='100%' height={50} />
          </Grid>
          <Grid item sm={6}>
            <Skeleton width='40%' />
            <Skeleton width='80%' height={50} />
          </Grid>
          <Grid item sm={6} display='flex' justifyContent='space-between'>
            <Skeleton height={50} width='20%' />
            <Skeleton width='10%' />
          </Grid>
          <Grid item sm={6} display='flex' justifyContent='space-between'>
            <Skeleton width='20%' />
            <Skeleton width='10%' />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
    <Card>
      <Skeleton variant='rectangular' height={80} />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={45} />
            <Skeleton
              variant='rounded'
              width='100%'
              height={70}
              sx={{ mt: 2 }}
            />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={45} />
            <Skeleton
              variant='rounded'
              width='100%'
              height={70}
              sx={{ mt: 2 }}
            />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={45} />
            <Skeleton
              variant='rounded'
              width='100%'
              height={70}
              sx={{ mt: 2 }}
            />
          </Grid>
        </Grid>
        <Grid container columnSpacing={4} rowSpacing={2} mt={5}>
          <Grid item sm={6} display='flex' justifyContent='space-between'>
            <Skeleton height={50} width='40%' />
            <Skeleton width='10%' />
          </Grid>
          <Grid item sm={6} display='flex' justifyContent='space-between'>
            <Skeleton width='20%' />
            <Skeleton width='30%' />
          </Grid>
          <Grid item sm={6} display='flex' justifyContent='space-between'>
            <Skeleton height={50} width='35%' />
            <Skeleton width='15%' />
          </Grid>
          <Grid item sm={6} display='flex' justifyContent='space-between'>
            <Skeleton width='40%' />
            <Skeleton width='10%' />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
    <Card>
      <Skeleton variant='rectangular' height={80} />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={116} />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={116} />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={116} />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={116} />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={116} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </Stack>
)

export default DetailTabSkeleton
