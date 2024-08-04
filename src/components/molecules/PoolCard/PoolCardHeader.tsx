import { Box, Collapse, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { memo, useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import BoxBackground from '@/components/atoms/BoxBackground'
import ImageWithFallback from '@/components/atoms/ImageWithFallback'
import PoolAvatar from '@/components/atoms/PoolAvatar'

interface PoolCardHeaderProps {
  pool: PoolOverview
  hover?: boolean
}

const PoolCardHeader: React.FC<PoolCardHeaderProps> = ({ pool, hover }) => {
  const { poolName, thumbnailImageUrl } = useMemo(() => {
    return {
      thumbnailImageUrl: pool?.thumbnailImageUrl || '',
      poolName: pool?.poolName || '',
      poolBannerImg: pool?.bannerImageUrl || undefined,
    }
  }, [pool])

  const currentDevice = useDeviceDetection()

  const height = currentDevice === Device.MOBILE ? 48 : 72

  return (
    <Box>
      <Collapse in={!hover} collapsedSize={142}>
        <ImageWithFallback
          coverProps={{ height: 238, borderRadius: 0 }}
          src={thumbnailImageUrl}
        />
      </Collapse>
      <BoxBackground display='flex' alignItems='center' sx={{ p: 2, height }}>
        <PoolAvatar
          name={poolName}
          showStatus
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              width: 32,
              height: 32,
            },
          })}
        />
        <Typography
          variant='h5'
          fontSize={{ xs: 16, sm: 20 }}
          component='div'
          sx={{
            ml: 1,
            lineClamp: 2,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            textOverflow: 'ellipsis',
          }}
        >
          {poolName}
        </Typography>
      </BoxBackground>
    </Box>
  )
}

export default memo(PoolCardHeader)
