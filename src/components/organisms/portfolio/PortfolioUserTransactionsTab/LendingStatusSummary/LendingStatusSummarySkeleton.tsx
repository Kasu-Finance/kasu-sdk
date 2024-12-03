import { Skeleton, Stack } from '@mui/material'

const LendingStatusSummarySkeleton = () => (
  <Stack spacing={8}>
    <Stack spacing={2} mt={4}>
      <Skeleton variant='rounded' height={50} />
      <Skeleton variant='rounded' height={30} />
      <Skeleton variant='rounded' height={30} />
      <Skeleton variant='rounded' height={30} />
      <Skeleton variant='rounded' height={30} />
      <Skeleton variant='rounded' height={30} />
    </Stack>
    <Stack spacing={2} mt={4}>
      <Skeleton variant='rounded' height={50} />
      <Skeleton variant='rounded' height={30} />
      <Skeleton variant='rounded' height={30} />
      <Skeleton variant='rounded' height={30} />
    </Stack>
  </Stack>
)
export default LendingStatusSummarySkeleton
