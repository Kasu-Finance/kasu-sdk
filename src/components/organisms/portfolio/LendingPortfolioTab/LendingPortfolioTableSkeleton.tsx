import { Skeleton, Stack } from '@mui/material'

const LendingPortfolioTableSkeleton = () => (
  <Stack px={2} py={2}>
    <Skeleton variant='rounded' height={60} />
    <Skeleton variant='rounded' width='25%' height={20} sx={{ mt: 2, mb: 1 }} />
    <Skeleton variant='rounded' height={40} />
    <Skeleton variant='rounded' width='20%' height={20} sx={{ mt: 2, mb: 1 }} />
    <Skeleton variant='rounded' height={40} />
    <Skeleton variant='rounded' width='23%' height={20} sx={{ mt: 2, mb: 1 }} />
    <Skeleton variant='rounded' height={40} />
    <Skeleton variant='rounded' width='15%' height={20} sx={{ mt: 2, mb: 1 }} />
    <Skeleton variant='rounded' height={40} />
    <Skeleton variant='rounded' width='22%' height={20} sx={{ mt: 2, mb: 1 }} />
    <Skeleton variant='rounded' height={40} />
  </Stack>
)
export default LendingPortfolioTableSkeleton
