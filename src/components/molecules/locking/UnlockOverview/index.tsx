'use client'

import useUserLocks from '@/hooks/locking/useUserLocks'

import CardWidget from '@/components/atoms/CardWidget'
import UnlockCard from '@/components/molecules/locking/UnlockOverview/UnlockCard'

const UnlockOverview = () => {
  const { userLocks } = useUserLocks()

  const hasLockedTokens = userLocks && Boolean(userLocks.length)
  return (
    <CardWidget title='Your KSU Locking'>
      {hasLockedTokens
        ? userLocks.map((userLock) => (
            <UnlockCard key={userLock.startTime} userLock={userLock} />
          ))
        : 'No locked'}
    </CardWidget>
  )
}

export default UnlockOverview
