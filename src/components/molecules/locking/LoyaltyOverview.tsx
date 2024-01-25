'use client'

import { Button, Divider, Typography } from '@mui/material'

import useModalState from '@/hooks/modals/useModalState'

import CardWidget from '@/components/atoms/CardWidget'

const LoyaltyOverview = () => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

  return (
    <CardWidget
      title='Loyalty'
      cardAction={
        <Button variant='contained' onClick={handleOpen}>
          How to increase your loyalty level?
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
        Current loyalty level if Epoch ended today
      </Typography>
      <Divider />
      <Typography variant='h6' component='span' my='6px' mx={2} display='block'>
        Basic
      </Typography>
    </CardWidget>
  )
}

export default LoyaltyOverview
