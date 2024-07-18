'use client'

import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'

import useUserLocks from '@/hooks/locking/useUserLocks'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import UnlockFooter from '@/components/molecules/locking/UnlockOverview/UnlockFooter'
import UnlockHeader from '@/components/molecules/locking/UnlockOverview/UnlockHeader'
import UnlockMobileRow from '@/components/molecules/locking/UnlockOverview/UnlockMobileRow'
import UnlockRow from '@/components/molecules/locking/UnlockOverview/UnlockRow'

import { toBigNumber } from '@/utils'

const handleSort = (
  a: UserLock,
  b: UserLock,
  sort: Sort<typeof UNLOCK_TABLE_KEYS>
) => {
  const direction = sort.direction === 'asc' ? 1 : -1

  let aValue: number
  let bValue: number

  if (sort.key === 'lockedAmount' || sort.key === 'rKSUAmount') {
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
    let sortKey = sort.key

    if (sortKey === 'remainingDuration') {
      sortKey = 'endTime'
    }

    aValue = a[sortKey]
    bValue = b[sortKey]
  }

  return (aValue - bValue) * direction
}

export const UNLOCK_TABLE_KEYS = [
  'lockedAmount',
  'endTime',
  'remainingDuration',
  'lockPeriod',
  'rKSUAmount',
] as const

const UnlockOverview = () => {
  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  const { t } = useTranslation()

  const { userLocks } = useUserLocks()

  const hasLockedTokens = userLocks && Boolean(userLocks.length)

  return hasLockedTokens ? (
    <CardWidget title={t('locking.widgets.unlock.title')}>
      <CustomTable
        ariaLabel='KSU Locking Table'
        data={userLocks}
        defaultSortKey='endTime'
        handleSort={handleSort}
        headers={isMobile ? [] : UnlockHeader(t)}
        sortKeys={UNLOCK_TABLE_KEYS}
        footer={<UnlockFooter userLocks={userLocks} />}
        footerStyle={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            border: 'none',
          },
        })}
      >
        {(data) =>
          data.map((userLock) =>
            isMobile ? (
              <UnlockMobileRow
                key={userLock.id.toString()}
                userLock={userLock}
              />
            ) : (
              <UnlockRow key={userLock.id.toString()} userLock={userLock} />
            )
          )
        }
      </CustomTable>
    </CardWidget>
  ) : null
}

export default UnlockOverview
