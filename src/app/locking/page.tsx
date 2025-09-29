import { Container, Stack } from '@mui/material'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import LockingNotification from '@/components/organisms/locking/LockingNotification'
import LockingSkeleton from '@/components/organisms/locking/LockingSkeleton'
import LoyaltyStatus from '@/components/organisms/locking/LoyaltyStatus'
import UserFunds from '@/components/organisms/locking/UserFunds'
import UserRewards from '@/components/organisms/locking/UserRewards'
import WipRedirect from '@/components/organisms/locking/WipRedirect'

import { Routes } from '@/config/routes'

const Locking = async () => {
  return (
    <LiteModeRenderer
      renderOnLiteMode={redirect(Routes.lending.root.url)}
      otherwise={
        <Container maxWidth='lg'>
          <WipRedirect />
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
