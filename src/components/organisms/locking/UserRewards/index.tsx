'use client'

import useUserLocks from '@/hooks/locking/useUserLocks'
import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import UserRewardsTable from '@/components/organisms/locking/UserRewards/UserRewardsTable'

const UserRewards = () => {
  const { t } = useTranslation()

  const { userLocks, isLoading } = useUserLocks()

  if (isLoading || !userLocks || !userLocks.length) {
    return null
  }

  return (
    <CustomCard>
      <CustomCardHeader title={t('locking.widgets.unlock.title')} />
      <CustomInnerCardContent sx={{ p: 0 }}>
        <UserRewardsTable userLocks={[]} />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default UserRewards
