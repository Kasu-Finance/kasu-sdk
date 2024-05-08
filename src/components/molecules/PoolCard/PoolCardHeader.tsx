import { alpha, Box, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import ImageWithFallback from '@/components/atoms/ImageWithFallback'
import PoolAvatar from '@/components/atoms/PoolAvatar'

interface PoolCardHeaderProps {
  pool: PoolOverview
}

const PoolCardHeader: React.FC<PoolCardHeaderProps> = ({ pool }) => {
  const { poolName, poolAvatarImg, poolBannerImg } = useMemo(() => {
    return {
      poolName: pool?.poolName || '',
      poolAvatarImg: pool?.thumbnailImageUrl || '',
      poolBannerImg: pool?.bannerImageUrl || '',
    }
  }, [pool])

  return (
    <Box>
      <ImageWithFallback src={poolBannerImg} />
      <Box
        display='flex'
        alignItems='center'
        sx={(theme) => ({
          py: 1,
          px: 1.5,
          background: alpha(theme.palette.primary.main, 0.08),
        })}
      >
        <PoolAvatar src={poolAvatarImg} name={poolName} showStatus />
        <Typography variant='h6' component='h1' sx={{ ml: 2 }}>
          {poolName}
        </Typography>
      </Box>
    </Box>
  )
}

export default PoolCardHeader
