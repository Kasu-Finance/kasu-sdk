import { Card, CardContent, Grid, Skeleton, Stack } from '@mui/material'

const LockingSkeleton = () => (
  <Stack spacing={3} mt={3}>
    <Card>
      <Skeleton variant='rectangular' height={80} />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={58} />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={58} />
          </Grid>
        </Grid>
        <Grid container spacing={3} mt={3}>
          <Grid item flex={1} display='flex' justifyContent='end'>
            <Skeleton
              variant='rounded'
              width={368}
              height={48}
              sx={{ borderRadius: 30 }}
            />
          </Grid>
          <Grid item flex={1}>
            <Skeleton
              variant='rounded'
              width={368}
              height={48}
              sx={{ borderRadius: 30 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
    <Card>
      <Skeleton variant='rectangular' height={80} />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={58} />
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={58} />
          </Grid>
        </Grid>
        <Grid container spacing={3} mt={3}>
          <Grid item flex={1} display='flex' justifyContent='end'>
            <Skeleton
              variant='rounded'
              width={368}
              height={48}
              sx={{ borderRadius: 30 }}
            />
          </Grid>
          <Grid item flex={1}>
            <Skeleton
              variant='rounded'
              width={368}
              height={48}
              sx={{ borderRadius: 30 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
    <Card>
      <Skeleton variant='rectangular' height={80} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='40%' height={45} />
            <Stack spacing={2} mt={5}>
              <Skeleton variant='rounded' width='100%' height={72} />
              <Skeleton variant='rounded' width='100%' height={152} />
            </Stack>
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height='100%' />
          </Grid>
          <Grid item flex={1}>
            <Stack spacing={1}>
              <Skeleton variant='rounded' width='100%' height={125} />
              <Skeleton variant='rounded' width='100%' height={58} />
              <Skeleton variant='rounded' width='100%' height={58} />
              <Skeleton variant='rounded' width='100%' height={58} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
    <Card>
      <Skeleton variant='rectangular' height={80} />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={58} />
            <Stack spacing={1} mt={2}>
              <Skeleton variant='rounded' width='100%' height={58} />
              <Skeleton variant='rounded' width='100%' height={58} />
              <Skeleton variant='rounded' width='100%' height={58} />
            </Stack>
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={58} />
            <Stack spacing={1} mt={2}>
              <Skeleton variant='rounded' width='100%' height={58} />
              <Skeleton variant='rounded' width='100%' height={58} />
              <Skeleton variant='rounded' width='100%' height={58} />
            </Stack>
          </Grid>
          <Grid item flex={1}>
            <Skeleton variant='rounded' width='100%' height={58} />
            <Stack spacing={1} mt={2}>
              <Skeleton variant='rounded' width='100%' height={58} />
              <Skeleton variant='rounded' width='100%' height={58} />
              <Skeleton variant='rounded' width='100%' height={58} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </Stack>
)

export default LockingSkeleton
