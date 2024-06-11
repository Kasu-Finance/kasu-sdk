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

import { PoolDelegateMetricIds } from '@/constants'

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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          '& .image-cover': {
            height: 141,
          },
          [`& .${PoolDelegateMetricIds.Security}, .${PoolDelegateMetricIds.LendingHistory}`]:
            {
              maxHeight: 200,
            },
          '& .pool-card-overview-button': {
            width: 132,
            padding: '6px 16px',
          },
        },
      }}
    >
      <PoolCardHeader pool={pool} />
      <PoolCardContent pool={pool} poolDelegate={poolDelegate} />
      <PoolCardActions pool={pool} link={link} />
    </Card>
  )
}

export default PoolCard
