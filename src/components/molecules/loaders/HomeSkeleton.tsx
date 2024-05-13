import { Box, Container } from '@mui/material'

import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'
import PoolCardSkeleton from '@/components/molecules/loaders/PoolCardSkeleton'
import TabsSkeleton from '@/components/molecules/loaders/TabsSkeleton'

const HomeSkeleton = () => {
  return (
    <Container maxWidth='lg'>
      <Box>
        <CardSkeleton leftRowNumbers={1} rightRowNumbers={1} />
      </Box>
      <TabsSkeleton numTabs={2} />
      <Box sx={{ mt: 0.5 }} display='flex' justifyContent='space-between'>
        <Box sx={{ flexBasis: '33.333%', mr: 2.5 }}>
          <PoolCardSkeleton />
        </Box>
        <Box sx={{ flexBasis: '33.333%', mr: 2.5 }}>
          <PoolCardSkeleton />
        </Box>
        <Box sx={{ flexBasis: '33.333%' }}>
          <PoolCardSkeleton />
        </Box>
      </Box>
    </Container>
  )
}

export default HomeSkeleton
