import { Box, Button, Card, Skeleton, Stack } from '@mui/material'

const PoolCardSkeleton = () => {
  return (
    <Card sx={{ padding: 2, minHeight: '572px' }}>
      <Skeleton variant='rectangular' height={100} />
      <Stack
        direction='row'
        alignItems='center'
        spacing={1}
        sx={{ marginTop: 2 }}
      >
        <Skeleton variant='circular' width={50} height={50} />{' '}
        <Skeleton variant='text' width='50%' height={50} />{' '}
      </Stack>
      <Box mt={1}>
        {Array.from(new Array(5)).map((_, index) => (
          <Skeleton key={index} variant='text' height={60} />
        ))}
      </Box>
      <Stack
        direction='row'
        spacing={1}
        justifyContent='center'
        sx={{ marginTop: 3 }}
      >
        <Button variant='contained' disabled>
          <Skeleton width={100} height={50} />
        </Button>
        <Button variant='contained' disabled>
          <Skeleton width={100} height={50} />
        </Button>
      </Stack>
    </Card>
  )
}

export default PoolCardSkeleton
