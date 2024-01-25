'use client'

import { Box, Button, Divider, Typography } from '@mui/material'

import useModalState from '@/hooks/modals/useModalState'

const LoyaltyOverview = () => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

  return (
    <>
      <Typography variant='h6' component='span' mt={1} mb={2} display='block'>
        Loyalty
      </Typography>
      <Box py={2}>
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
        <Typography
          variant='h6'
          component='span'
          my='6px'
          mx={2}
          display='block'
        >
          Basic
        </Typography>
      </Box>
      <Button
        variant='contained'
        sx={{ width: 351, margin: '8px auto 0 auto', display: 'block' }}
        onClick={handleOpen}
      >
        How to increase your loyalty level?
      </Button>
    </>
  )
}

export default LoyaltyOverview
