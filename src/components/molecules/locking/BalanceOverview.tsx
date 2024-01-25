'use client'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import useModalState from '@/hooks/modals/useModalState'

import CardWidget from '@/components/atoms/CardWidget'

const BalanceOverview = () => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: 'lockModal' })

  return (
    <CardWidget
      cardAction={
        <Button variant='contained' onClick={handleOpen}>
          LOCK
        </Button>
      }
    >
      <Typography
        p={(theme) => theme.spacing('6px', 2)}
        variant='subtitle2'
        component='span'
        display='block'
        mt={1}
      >
        Wallet Balance
      </Typography>
      <Divider />
      <Typography
        p={(theme) => theme.spacing('6px', 2)}
        variant='h6'
        component='span'
        display='block'
      >
        0.00 KSU
      </Typography>
    </CardWidget>
  )
}

export default BalanceOverview
