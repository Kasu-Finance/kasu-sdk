import { Container, Stack } from '@mui/material'

import BonusRewardSummary from '@/components/organisms/locking/BonusRewardSummary'
import LoyaltyStatus from '@/components/organisms/locking/LoyaltyStatus'
import RewardsBreakdown from '@/components/organisms/locking/RewardsBreakdown'
import UserFunds from '@/components/organisms/locking/UserFunds'
import UserRewards from '@/components/organisms/locking/UserRewards'

const Locking = async () => {
  return (
    <Container maxWidth='lg'>
      <Stack spacing={3}>
        <BonusRewardSummary />
        <UserFunds />
        <LoyaltyStatus />
        <RewardsBreakdown />
        <UserRewards />
      </Stack>
    </Container>
  )
}

export default Locking
