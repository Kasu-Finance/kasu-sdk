'use client'

import { Grid } from '@mui/material'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { formatUnits } from 'ethers/lib/utils'

import useModalState from '@/hooks/context/useModalState'
import useUserBalance from '@/hooks/web3/useUserBalance'

import CardWidget from '@/components/atoms/CardWidget'

import sdkConfig from '@/config/sdk'

const BalanceOverview = () => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: 'lockModal' })

  const { balance, symbol, decimals } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

  return (
    <CardWidget
      cardAction={
        <>
          <Button
            sx={{ width: 108 }}
            variant='outlined'
            href='https://www.google.com'
            target='_blank'
          >
            BUY KSU
          </Button>
          <Button sx={{ wixth: 117 }} variant='contained' onClick={handleOpen}>
            LOCK KSU
          </Button>
        </>
      }
    >
      <Grid container spacing={1.25}>
        <Grid item xs={5}>
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
            p={(theme) => theme.spacing('6px', 0, '6px', 2)}
            variant='h6'
            component='span'
            display='inline-block'
          >
            {formatUnits(balance || '0', decimals)}
          </Typography>
          <Typography
            p={(theme) => theme.spacing('6px', 2, '6px', 1)}
            variant='body1'
            component='span'
          >
            {symbol ?? 'KSU'}
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography
            p={(theme) => theme.spacing('6px', 2)}
            variant='subtitle2'
            component='span'
            display='block'
            mt={1}
          >
            Available Funds
          </Typography>

          <Divider />
          <Typography
            p={(theme) => theme.spacing('6px', 0, '6px', 2)}
            variant='h6'
            component='span'
            display='inline-block'
          >
            9000
          </Typography>
          <Typography
            p={(theme) => theme.spacing('6px', 2, '6px', 1)}
            variant='body1'
            component='span'
          >
            USDC
          </Typography>
        </Grid>
      </Grid>
    </CardWidget>
  )
}

export default BalanceOverview
