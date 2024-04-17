import { Card } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import PoolCardActions from '@/components/molecules/PoolCard/PoolCardActions'
import PoolCardContent from '@/components/molecules/PoolCard/PoolCardContent'
import PoolCardHeader from '@/components/molecules/PoolCard/PoolCardHeader'

interface PoolCardProps {
  pool: PoolOverview
  link: string
}

const PoolCard: React.FC<PoolCardProps> = ({ pool, link }) => {
  return (
    <Card>
      <PoolCardHeader pool={pool} />

      <PoolCardContent pool={pool} />

      <PoolCardActions link={link} />
    </Card>
  )
}

export default PoolCard
