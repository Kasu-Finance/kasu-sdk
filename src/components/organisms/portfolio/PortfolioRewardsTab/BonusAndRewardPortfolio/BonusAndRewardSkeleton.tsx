import { Skeleton, Stack } from '@mui/material'

const BonusAndRewardSkeleton = () => (
  <Stack spacing={2} p={2}>
    <Skeleton variant='rounded' height={60} />
    <Skeleton variant='rounded' height={40} />
    <Skeleton variant='rounded' height={40} />
    <Skeleton variant='rounded' height={40} />
  </Stack>
)

export default BonusAndRewardSkeleton
