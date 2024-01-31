'use client'

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
        {formatUnits(balance || '0', decimals)} {symbol ?? 'KSU'}
      </Typography>
    </CardWidget>
  )
}

export default BalanceOverview
