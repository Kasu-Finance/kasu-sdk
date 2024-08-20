import { Stack } from '@mui/material'

import DelegateProfile from '@/components/organisms/lending/DetailsTab/DelegateProfile'
import PoolDetails from '@/components/organisms/lending/DetailsTab/PoolDetails'
import PoolTraction from '@/components/organisms/lending/DetailsTab/PoolTraction'
import RiskManagement from '@/components/organisms/lending/DetailsTab/RiskManagement'

import { getPoolWithDelegate } from '@/app/api/poolWithDelegate'
import { getRiskManagement } from '@/app/api/riskManagement'

type PoolDetailsProps = {
  poolId: string
}

const PoolDetailsTab: React.FC<PoolDetailsProps> = async ({ poolId }) => {
  const [poolsWithDelegate, riskManagement] = await Promise.all([
    getPoolWithDelegate(poolId),
    getRiskManagement(poolId),
  ])

  return (
    <Stack spacing={3} mt={3}>
      <DelegateProfile pool={poolsWithDelegate[0]} />
      <PoolDetails pool={poolsWithDelegate[0]} />
      <PoolTraction pool={poolsWithDelegate[0]} />
      {riskManagement && <RiskManagement riskManagement={riskManagement} />}
    </Stack>
  )
}

export default PoolDetailsTab
