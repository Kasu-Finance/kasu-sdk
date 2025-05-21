'use client'

import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import Image from 'next/image'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import NextLink from '@/components/atoms/NextLink'

import { CloseRoundedIcon } from '@/assets/icons'

import { Routes } from '@/config/routes'

const NftDetectedModal: React.FC<DialogChildProps> = ({ handleClose }) => {
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
          LinkComponent={NextLink}
          href={Routes.portfolio.rewards.url}
          sx={{ maxWidth: 180, textTransform: 'capitalize' }}
          fullWidth
          onClick={handleClose}
        >
          Go to Portfolio
        </Button>
      </Stack>
    </Box>
  )
}

export default NftDetectedModal
