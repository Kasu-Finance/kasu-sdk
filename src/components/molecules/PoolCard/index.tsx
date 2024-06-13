'use client'

import { Card } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  const [cardHover, setCardHover] = useState(false)

  if (!poolDelegate) return null

  return (
    <Card
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
      onClick={() => {
        currentDevice === Device.MOBILE && router.push(link)
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '760px',
      }}
    >
      <PoolCardHeader pool={pool} hover={cardHover} />
      <PoolCardContent
        pool={pool}
        poolDelegate={poolDelegate}
        hover={cardHover}
      />
      <PoolCardActions pool={pool} link={link} hover={cardHover} />
    </Card>
  )
}

export default PoolCard
