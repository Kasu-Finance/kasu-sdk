'use client'

import { Card } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { useRouter } from 'next/navigation'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import PoolCardActions from '@/components/molecules/PoolCard/PoolCardActions'
import PoolCardContent from '@/components/molecules/PoolCard/PoolCardContent'
import PoolCardHeader from '@/components/molecules/PoolCard/PoolCardHeader'

interface PoolCardProps {
  pool: PoolOverview
  poolDelegate?: PoolDelegateProfileAndHistory
  link: string
}

const PoolCard: React.FC<PoolCardProps> = ({ pool, poolDelegate, link }) => {
  const router = useRouter()
  const currentDevice = useDeviceDetection()

  if (!poolDelegate) return null

  return (
    <Card
      onClick={() => {
        currentDevice === Device.MOBILE && router.push(link)
      }}
    >
      <PoolCardHeader pool={pool} />
      <PoolCardContent pool={pool} poolDelegate={poolDelegate} />
      <PoolCardActions pool={pool} link={link} />
    </Card>
  )
}

export default PoolCard
