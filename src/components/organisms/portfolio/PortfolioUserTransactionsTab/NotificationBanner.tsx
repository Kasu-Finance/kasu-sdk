'use client'

import { Button, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import WaveBox from '@/components/atoms/WaveBox'

import { ModalsKeys } from '@/context/modal/modal.types'

const NotificationBanner = () => {
  const { t } = useTranslation()

  const { openModal } = useModalState()
  const handleOpen = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

  return (
    <WaveBox
      variant='gold'
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      px={2}
      py={3}
      borderRadius={2}
    >
      <Typography variant='h3'>
        {t('portfolio.transactions.notification.title').replace(
          '{count}',
          '(X)'
        )}
      </Typography>
      <Button
        variant='outlined'
        color='secondary'
        sx={{ height: 32, width: 101, textTransform: 'capitalize' }}
        onClick={handleOpen}
      >
        {t('portfolio.transactions.notification.action')}
      </Button>
    </WaveBox>
  )
}

export default NotificationBanner
