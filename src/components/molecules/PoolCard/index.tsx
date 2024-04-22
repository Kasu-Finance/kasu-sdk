import { Card } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'

import PoolCardActions from '@/components/molecules/PoolCard/PoolCardActions'
import PoolCardContent from '@/components/molecules/PoolCard/PoolCardContent'
import PoolCardHeader from '@/components/molecules/PoolCard/PoolCardHeader'

interface PoolCardProps {
  pool: PoolOverview
  poolDelegate: PoolDelegateProfileAndHistory
  link: string
}

const PoolCard: React.FC<PoolCardProps> = ({ pool, poolDelegate, link }) => {
  console.warn('poolDelegate', poolDelegate)
  console.warn('pool', pool)
  return (
    <Card>
      <PoolCardHeader pool={pool} />

      <PoolCardContent pool={pool} poolDelegate={poolDelegate} />

      <PoolCardActions link={link} />
    </Card>
  )
}

export default PoolCard
