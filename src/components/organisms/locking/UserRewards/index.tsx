'use client'

import { Typography } from '@mui/material'

import useUserLocks from '@/hooks/locking/useUserLocks'
import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
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
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('locking.widgets.unlock.title')}
      </Typography>
      <CustomInnerCardContent sx={{ p: 0 }}>
        <UserRewardsTable userLocks={[]} />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default UserRewards
