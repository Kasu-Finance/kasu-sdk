import { Box, Skeleton } from '@mui/material'

import WaveBox from '@/components/atoms/WaveBox'

const HomeOverviewSkeleton = () => (
  <Box
    display={{ xs: 'grid' }}
    gridTemplateColumns={{
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(5, minmax(0, 1fr))',
    }}
    gap={{ xs: 2 }}
    mb={2}
  >
    {[...Array(5)].map((_, index) => (
      <WaveBox borderRadius={2} px={2} py={4} height={116} key={index}>
        <Skeleton />
        <Skeleton />
      </WaveBox>
    ))}
  </Box>
)

export default HomeOverviewSkeleton
