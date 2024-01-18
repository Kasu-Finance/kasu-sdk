'use client'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import useModalState from '@/context/modal/useModalState'

const BalanceOverview = () => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: 'lockModal' })

  return (
    <>
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
      <Button
        variant='contained'
        sx={{
          width: 83,
          margin: '24px auto 0 auto',
          display: 'block',
        }}
        onClick={handleOpen}
      >
        LOCK
      </Button>
    </>
  )
}

export default BalanceOverview
