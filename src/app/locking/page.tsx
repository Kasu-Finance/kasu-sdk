import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'

import BalanceOverview from '@/components/molecules/locking/BalanceOverview'
import EpochOverview from '@/components/molecules/locking/EpochOverview'
import LoyaltyOverview from '@/components/molecules/locking/LoyaltyOverview'
import RewardsOverview from '@/components/molecules/locking/RewardsOverview'
import UnlockOverview from '@/components/molecules/locking/UnlockOverview'
import PageHeader from '@/components/molecules/PageHeader'

const Locking = () => {
  return (
    <Container maxWidth='lg'>
      <PageHeader title='Locking' />
      <Box
        mt={3}
        display='grid'
        gridTemplateColumns='repeat(2, minmax(0, 1fr))'
        gap={3}
      >
        <Box display='grid' gap={3}>
          <Box
            component={Paper}
            px={2}
            py={1}
            display='flex'
            flexDirection='column'
          >
            <BalanceOverview />
          </Box>
          <Box
            component={Paper}
            px={2}
            py={1}
            display='flex'
            flexDirection='column'
          >
            <UnlockOverview />
          </Box>
          <Box
            component={Paper}
            px={2}
            py={1}
            display='flex'
            flexDirection='column'
          >
            <RewardsOverview />
          </Box>
        </Box>
        <Box
          display='grid'
          gridTemplateRows='repeat(2, minmax(0, max-content))'
          gap={3}
        >
          <Box
            component={Paper}
            px={2}
            py={1}
            display='flex'
            flexDirection='column'
          >
            <LoyaltyOverview />
          </Box>
          <Box
            component={Paper}
            px={2}
            py={1}
            display='flex'
            flexDirection='column'
          >
            <EpochOverview />
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default Locking
