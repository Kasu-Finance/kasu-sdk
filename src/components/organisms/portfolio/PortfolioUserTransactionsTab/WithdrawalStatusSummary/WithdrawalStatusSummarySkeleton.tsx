import { Skeleton, Stack } from '@mui/material'

const WithdrawalStatusSummarySkeleton = () => (
  <Stack spacing={2} mt={4}>
    <Skeleton variant='rounded' height={50} />
    <Skeleton variant='rounded' height={30} />
    <Skeleton variant='rounded' height={30} />
    <Skeleton variant='rounded' height={30} />
  </Stack>
)

export default WithdrawalStatusSummarySkeleton
