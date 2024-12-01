'use client'

import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'

import useUserLocks from '@/hooks/locking/useUserLocks'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import UserRewardsTable from '@/components/organisms/locking/UserRewards/UserRewardsTable'

type UserRewardsTableWrapperProps = {
  lockPeriods: LockPeriod[]
}

const UserRewardsWrapper: React.FC<UserRewardsTableWrapperProps> = ({
  lockPeriods,
}) => {
  const { t } = getTranslation()

  const { userLocks, isLoading } = useUserLocks()

  if (isLoading || !userLocks || !userLocks.length) {
    return null
  }

  return (
    <CustomCard>
      <CustomCardHeader title={t('locking.widgets.unlock.title')} />
      <CustomInnerCardContent sx={{ p: 0 }}>
        <UserRewardsTable userLocks={userLocks} lockPeriods={lockPeriods} />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default UserRewardsWrapper
