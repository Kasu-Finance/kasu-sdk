import { Box, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import BoxBackground from '@/components/atoms/BoxBackground'
import ImageWithFallback from '@/components/atoms/ImageWithFallback'
import PoolAvatar from '@/components/atoms/PoolAvatar'

interface PoolCardHeaderProps {
  pool: PoolOverview
}

const PoolCardHeader: React.FC<PoolCardHeaderProps> = ({ pool }) => {
  const { poolName, poolAvatarImg, poolBannerImg } = useMemo(() => {
    return {
      poolName: pool?.poolName || '',
      poolAvatarImg: pool?.thumbnailImageUrl || undefined,
      poolBannerImg: pool?.bannerImageUrl || undefined,
    }
  }, [pool])

  return (
    <Box>
      <ImageWithFallback src={poolBannerImg} />
      <BoxBackground display='flex' alignItems='center' sx={{ p: 2 }}>
        <PoolAvatar src={poolAvatarImg} name={poolName} showStatus />
        <Typography variant='h5' sx={{ ml: 1 }}>
          {poolName}
        </Typography>
      </BoxBackground>
    </Box>
  )
}

export default PoolCardHeader
