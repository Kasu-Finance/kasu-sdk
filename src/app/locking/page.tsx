import { Container, Stack } from '@mui/material'
import { Suspense } from 'react'

import BonusRewardSummary from '@/components/organisms/locking/BonusRewardSummary'
import LockingSkeleton from '@/components/organisms/locking/LockingSkeleton'
import LoyaltyStatus from '@/components/organisms/locking/LoyaltyStatus'
import UserFunds from '@/components/organisms/locking/UserFunds'
import UserRewards from '@/components/organisms/locking/UserRewards'

const Locking = async () => {
  return (
    <Container maxWidth='lg'>
      <Stack spacing={3}>
        <Suspense fallback={<LockingSkeleton />}>
          <BonusRewardSummary />
          <UserFunds />
          <LoyaltyStatus />
          <UserRewards />
        </Suspense>
      </Stack>
    </Container>
  )
}

export default Locking
