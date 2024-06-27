'use client'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Paper, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import usePoolOverview from '@/hooks/lending/usePoolOverview'
import useTranslation from '@/hooks/useTranslation'

import BackButton from '@/components/atoms/BackButton'
import BoxBackground from '@/components/atoms/BoxBackground'
import ImageWithFallback from '@/components/atoms/ImageWithFallback'
import PoolAvatar from '@/components/atoms/PoolAvatar'
import PageHeaderSkeleton from '@/components/molecules/loaders/PageHeaderSkeleton'

type PageHeaderProps = {
  title: string
  poolId?: string
  loading?: boolean
  variant?: 'title' | 'hero'
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  poolId,
  variant = 'title',
}) => {
  const { t } = useTranslation()
  const { data, isLoading } = usePoolOverview(poolId)

  const { poolName, poolBannerImg } = useMemo(() => {
    const pool: PoolOverview | null = data?.length ? data[0] : null
    return {
      poolName: pool?.poolName || '',
      poolBannerImg: pool?.bannerImageUrl || '',
    }
  }, [data])

  if (variant === 'title') {
    return (
      <Typography variant='h6' component='h1'>
        {title}
      </Typography>
    )
  }

  if (isLoading) {
    return <PageHeaderSkeleton />
  }

  return (
    <Paper sx={{ borderRadius: '4px' }}>
      <ImageWithFallback src={poolBannerImg} coverProps={{ height: 132 }} />
      <BoxBackground
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        sx={{ p: 2 }}
      >
        <Box display='flex' alignItems='center'>
          <PoolAvatar name={poolName} showStatus />
          <Typography variant='h5' sx={{ ml: 1 }}>
            {poolName || title}
          </Typography>
        </Box>

        <BackButton variant='contained' startIcon={<ArrowBackIcon />}>
          <Typography
            variant='subtitle2'
            sx={{ fontSize: 15, letterSpacing: '0.5px' }}
          >
            {t('general.lending')} {t('general.strategies')}
          </Typography>
        </BackButton>
      </BoxBackground>
    </Paper>
  )
}

export default PageHeader
