import { Box, Card, CardContent, Grid, Skeleton, Stack } from '@mui/material'

const RiskReportingTabSkeleton = () => (
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
      </CardContent>
    </Card>
    <Card>
      <Skeleton variant='rectangular' height={80} />
      <CardContent>
        <Grid container mt={3} justifyContent='space-between'>
          <Grid item display='flex'>
            <Box minWidth={200} mr={2}>
              <Skeleton variant='rectangular' height={30} />
              <Stack mt={3} spacing={1}>
                <Skeleton variant='rounded' width='60%' height={30} />
                <Skeleton variant='rounded' width='60%' height={30} />
                <Skeleton variant='rounded' width='60%' height={30} />
                <Skeleton variant='rounded' width='60%' height={30} />
              </Stack>
            </Box>
            <Skeleton variant='circular' width={210} height={210} />
          </Grid>
          <Grid item display='flex'>
            <Box minWidth={200} mr={2}>
              <Skeleton variant='rectangular' height={30} />
              <Stack mt={3} spacing={1}>
                <Skeleton variant='rounded' width='60%' height={30} />
                <Skeleton variant='rounded' width='60%' height={30} />
                <Skeleton variant='rounded' width='60%' height={30} />
                <Skeleton variant='rounded' width='60%' height={30} />
              </Stack>
            </Box>
            <Skeleton variant='circular' width={210} height={210} />
          </Grid>
        </Grid>
        <Stack spacing={2} mt={6}>
          <Skeleton variant='rounded' height={60} />
          <Skeleton variant='rounded' height={30} />
          <Skeleton variant='rounded' height={30} />
          <Skeleton variant='rounded' height={30} />
          <Skeleton variant='rounded' height={30} />
        </Stack>
        <Grid container mt={12} justifyContent='space-between'>
          <Grid item>
            <Grid container maxWidth={520} columnSpacing={3}>
              <Grid item minWidth={100}>
                <Stack spacing={1}>
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                </Stack>
              </Grid>
              <Grid item>
                <Grid
                  container
                  columnSpacing={1}
                  height='100%'
                  sx={{
                    '.MuiSkeleton-root': { transform: 'unset' },
                    '.MuiGrid-root': {
                      alignItems: 'end',
                      display: 'flex',
                    },
                  }}
                >
                  <Grid item>
                    <Skeleton width={20} height='20%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='10%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='50%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='90%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='40%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='50%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='10%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='15%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='70%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='90%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='40%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='50%' />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Stack minWidth={200} mt={3} spacing={1}>
              <Skeleton variant='rounded' width='70%' height={20} />
              <Skeleton variant='rounded' width='60%' height={20} />
              <Skeleton variant='rounded' width='65%' height={20} />
            </Stack>
          </Grid>
          <Grid item>
            <Grid container maxWidth={520} columnSpacing={3}>
              <Grid item minWidth={100}>
                <Stack spacing={1}>
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />
                  <Skeleton variant='rounded' height={10} />{' '}
                </Stack>
              </Grid>
              <Grid item>
                <Grid
                  container
                  columnSpacing={1}
                  height='100%'
                  sx={{
                    '.MuiSkeleton-root': { transform: 'unset' },
                    '.MuiGrid-root': {
                      alignItems: 'end',
                      display: 'flex',
                    },
                  }}
                >
                  <Grid item>
                    <Skeleton width={20} height='20%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='10%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='50%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='90%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='40%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='50%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='10%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='15%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='70%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='90%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='40%' />
                  </Grid>
                  <Grid item>
                    <Skeleton width={20} height='50%' />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Stack minWidth={200} mt={3} spacing={1}>
              <Skeleton variant='rounded' width='70%' height={20} />
              <Skeleton variant='rounded' width='60%' height={20} />
              <Skeleton variant='rounded' width='65%' height={20} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </Stack>
)

export default RiskReportingTabSkeleton
