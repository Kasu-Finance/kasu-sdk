'use client'

import { Box, Paper, styled, Typography } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/types'
import Image from 'next/image'
import React, { useMemo } from 'react'

import usePoolOverview from '@/hooks/lending/usePoolOverview'
import useTranslation from '@/hooks/useTranslation'

import BackButton from '@/components/atoms/BackButton'
import PoolAvatar from '@/components/atoms/PoolAvatar'
import PageHeaderSkeleton from '@/components/molecules/loaders/PageHeaderSkeleton'

import ArrowLeftIcon from '@/assets/icons/general/ArrowLeftIcon'
import ImagePlaceholderIcon from '@/assets/icons/general/ImagePlaceholderIcon'

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
  loading = false,
}) => {
  const { t } = useTranslation()
  const { data } = usePoolOverview(poolId)

  const { poolName, poolAvatarImg, poolBannerImg } = useMemo(() => {
    const pool: PoolOverview | null = data?.length ? data[0] : null
    return {
      poolName: pool?.poolName || '',
      poolAvatarImg: pool?.thumbnailImageUrl || '',
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

  if (loading) {
    return <PageHeaderSkeleton />
  }

  return (
    <Paper sx={{ borderRadius: '4px' }}>
      <ImageContainer>
        {poolBannerImg ? (
          <Image
            fill
            src={poolBannerImg}
            alt="Pool's image"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <ImagePlaceholderIcon />
        )}
      </ImageContainer>

      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        p={2}
      >
        <Box display='flex' alignItems='center'>
          <PoolAvatar src={poolAvatarImg} name={poolName} />
          <Typography variant='h6' component='h1' sx={{ ml: 2 }}>
            {poolName || title}
          </Typography>
        </Box>

        <BackButton variant='outlined' startIcon={<ArrowLeftIcon />}>
          <Typography
            variant='subtitle2'
            sx={{ fontSize: 15, letterSpacing: '0.5px' }}
          >
            {t('general.pools')}
          </Typography>
        </BackButton>
      </Box>
    </Paper>
  )
}

export default PageHeader

const ImageContainer = styled(Box)((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  width: '100%',
  height: '100px',
  overflow: 'hidden',
  background: props.theme.palette.grey[300],
  borderTopRightRadius: '4px',
  borderTopLeftRadius: '4px',
}))
