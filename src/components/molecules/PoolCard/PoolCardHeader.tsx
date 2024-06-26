import { Box, Collapse, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { memo, useMemo } from 'react'

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

  return (
    <Box>
      <Collapse in={!hover} collapsedSize={142}>
        <ImageWithFallback
          coverProps={{ height: 240, borderRadius: 0 }}
          src={thumbnailImageUrl}
        />
      </Collapse>
      <BoxBackground
        display='flex'
        alignItems='center'
        sx={{ p: 2, height: '72px' }}
      >
        <PoolAvatar name={poolName} showStatus />
        <Typography
          variant='h5'
          fontSize={20}
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
