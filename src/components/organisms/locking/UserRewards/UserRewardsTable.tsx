import {
  LockPeriod,
  UserLock,
} from '@kasufinance/kasu-sdk/src/services/Locking/types'
import React from 'react'

import usePagination from '@/hooks/usePagination'

import CustomTable from '@/components/molecules/CustomTable'
import UserRewardsTableHeader from '@/components/organisms/locking/UserRewards/UserRewardsTableHeader'
import UserRewardsTableRow from '@/components/organisms/locking/UserRewards/UserRewardsTableRow'

type UserRewardsTableProps = {
  userLocks: UserLock[]
  lockPeriods: LockPeriod[]
}

const ROW_PER_PAGE = 10

const UserRewardsTable: React.FC<UserRewardsTableProps> = ({
  userLocks,
  lockPeriods,
}) => {
  const { currentPage, setPage, paginateData } = usePagination(
    ROW_PER_PAGE,
    userLocks.length
  )

  return (
    <CustomTable
      tableHeader={<UserRewardsTableHeader />}
      tableBody={[...paginateData(userLocks)].map((userLock) => (
        <UserRewardsTableRow
          key={userLock.id.toString()}
          userLock={userLock}
          lockPeriods={lockPeriods}
        />
      ))}
      paginationProps={
        userLocks.length > ROW_PER_PAGE
          ? {
              count: Math.ceil(userLocks.length / ROW_PER_PAGE),
              page: currentPage,
              onChange: (_, page) => setPage(page),
            }
          : undefined
      }
    />
  )
}

export default UserRewardsTable
