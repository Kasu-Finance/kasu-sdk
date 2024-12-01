import UserRewardsWrapper from '@/components/organisms/locking/UserRewards/UserRewardsWrapper'

import { getLockPeriods } from '@/app/_requests/lockPeriods'

const UserRewards = async () => {
  const lockPeriods = await getLockPeriods()

  return <UserRewardsWrapper lockPeriods={lockPeriods} />
}

export default UserRewards
