'use client'

import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'

import { CloseRoundedIcon } from '@/assets/icons'

import { Routes } from '@/config/routes'

const NftDetectedModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const router = useRouter()

  const handleButtonClick = () => {
    handleClose()
    router.push(Routes.portfolio.rewards.url)
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      position='relative'
    >
      <IconButton
        onClick={handleClose}
        sx={{ position: 'absolute', right: 16, top: 16 }}
      >
        <CloseRoundedIcon />
      </IconButton>
      <Image
        src='/images/nft-cat.png'
        alt='NFT Detected'
        width={350}
        height={350}
      />
      <Stack alignItems='center' spacing={2}>
        <Typography variant='h3' textAlign='center' px={3} color='#C4996C'>
          We see Kasu NFTs in your wallet
        </Typography>
        <Typography variant='baseMd' textAlign='center' px={3} color='white'>
          Check out{' '}
          <Typography variant='baseMd' fontWeight={600}>
            {'My Portfolio > Bonuses & Rewards'}
          </Typography>{' '}
          to track your rewards
        </Typography>
        <Button
          variant='contained'
          color='primary'
          sx={{ maxWidth: 180, textTransform: 'capitalize' }}
          fullWidth
          onClick={handleButtonClick}
        >
          Go to Portfolio
        </Button>
      </Stack>
    </Box>
  )
}

export default NftDetectedModal
