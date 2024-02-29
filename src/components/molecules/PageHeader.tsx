'use client'

import { Box, Paper, styled, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import AppAvatar from '@/components/atoms/AppAvatar'
import BackButton from '@/components/atoms/BackButton'
import NextImage from '@/components/atoms/NextImage'

import ArrowLeftIcon from '@/assets/icons/general/ArrowLeftIcon'
import ImagePlaceholderIcon from '@/assets/icons/general/ImagePlaceholderIcon'

type PageHeaderProps = {
  title: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const { t } = useTranslation()

  const poolAvatarImg = ''

  return (
    <Paper sx={{ borderRadius: '4px' }}>
      <ImageContainer>
        {poolAvatarImg ? (
          <NextImage
            fill
            src={poolAvatarImg}
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
          <AppAvatar src={poolAvatarImg} name='Pool Name' />
          <Typography variant='h6' component='h1' sx={{ ml: 2 }}>
            {title}
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
