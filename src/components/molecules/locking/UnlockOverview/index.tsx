'use client'

import { UserLock } from 'kasu-sdk/src/types'

import useUserLocks from '@/hooks/locking/useUserLocks'

import CardWidget from '@/components/atoms/CardWidget'
import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import UnlockFooter from '@/components/molecules/locking/UnlockOverview/UnlockFooter'
import UnlockHeader from '@/components/molecules/locking/UnlockOverview/UnlockHeader'
import UnlockRow from '@/components/molecules/locking/UnlockOverview/UnlockRow'

import { toBigNumber } from '@/utils'

const handleSort = (a: UserLock, b: UserLock, sort: Sort<UserLock>) => {
  const direction = sort.direction === 'asc' ? 1 : -1

  let aValue: number
  let bValue: number

  if (
    sort.key === 'lockedAmount' ||
    sort.key === 'rKSUAmount' ||
    sort.key === 'id'
  ) {
    aValue = toBigNumber(a[sort.key].toString())
      .div(toBigNumber('1'))
      .toNumber()
    bValue = toBigNumber(b[sort.key].toString())
      .div(toBigNumber('1'))
      .toNumber()
  } else if (sort.key === 'lockPeriod') {
    aValue = toBigNumber(a.lockPeriod.rKSUMultiplier.toString())
      .div(toBigNumber('1'))
      .toNumber()
    bValue = toBigNumber(b.lockPeriod.rKSUMultiplier.toString())
      .div(toBigNumber('1'))
      .toNumber()
  } else {
    aValue = a[sort.key]
    bValue = b[sort.key]
  }

  return (aValue - bValue) * direction
}

const UnlockOverview = () => {
  const { userLocks } = useUserLocks()

  const hasLockedTokens = userLocks && Boolean(userLocks.length)

  return hasLockedTokens ? (
    <CardWidget title='Your KSU Locking'>
      <CustomTable
        ariaLabel='KSU Locking Table'
        data={userLocks}
        defaultSortKey='endTime'
        handleSort={handleSort}
        headers={UnlockHeader}
        footer={<UnlockFooter userLocks={userLocks} />}
      >
        {(data) =>
          data.map((userLock) => (
            <UnlockRow key={userLock.id.toString()} userLock={userLock} />
          ))
        }
      </CustomTable>
    </CardWidget>
  ) : null
}

export default UnlockOverview
