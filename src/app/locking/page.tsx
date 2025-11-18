import { Container, Stack } from '@mui/material'
import { Suspense } from 'react'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import RedirectHandler from '@/components/atoms/RedirectHandler'
import LockingNotification from '@/components/organisms/locking/LockingNotification'
import LockingSkeleton from '@/components/organisms/locking/LockingSkeleton'
import LoyaltyStatus from '@/components/organisms/locking/LoyaltyStatus'
import UserFunds from '@/components/organisms/locking/UserFunds'
import UserRewards from '@/components/organisms/locking/UserRewards'

import { Routes } from '@/config/routes'

const Locking = async () => {
  return (
    <LiteModeRenderer
      renderOnLiteMode={<RedirectHandler to={Routes.lending.root.url} />}
      otherwise={
        <Container maxWidth='lg'>
          <Stack spacing={3}>
            <Suspense fallback={<LockingSkeleton />}>
              <LockingNotification />
              <LoyaltyStatus />
              <UserFunds />
              <UserRewards />
            </Suspense>
          </Stack>
        </Container>
      }
    />
  )
}

export default Locking
