'use client'

import { Button, Divider, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'

const LoyaltyOverview = () => {
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

  return (
    <CardWidget
      title='Loyalty'
      cardAction={
        <Button variant='contained' onClick={handleOpen}>
          {t('locking.widgets.loyality.button')}
        </Button>
      }
    >
      <Typography
        variant='subtitle2'
        component='span'
        my='6px'
        mx={2}
        display='block'
      >
        {t('locking.widgets.loyality.description')}
      </Typography>
      <Divider />
      <Typography
        variant='h6'
        component='span'
        my='6px'
        mx={2}
        display='block'
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.basic')}
      </Typography>
    </CardWidget>
  )
}

export default LoyaltyOverview
