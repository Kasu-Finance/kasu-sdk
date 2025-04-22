'use client'

import { Box, Stack, Typography } from '@mui/material'
import Image from 'next/image'

import WaveBox from '@/components/atoms/WaveBox'

import KasuTokenPromo from '@/images/kasu-token-promo.png'

const PromoBanner = () => {
  return (
    <WaveBox
      variant='gray'
      display='flex'
      alignItems='center'
      px={2}
      py={3}
      borderRadius={2}
      sx={{
        background: `url("/images/wave-dark-gray.png") repeat, #28282A`,
      }}
      height={64}
      gap={2}
      my={2.5}
    >
      <Box
        width={140}
        position='relative'
        display='flex'
        alignItems='center'
        sx={{ img: { position: 'absolute' } }}
      >
        <Image width={140} src={KasuTokenPromo} alt='Kasu Token Promo' />
      </Box>
      <Stack>
        <Typography variant='h5' color='gold.dark'>
          WIN UP TO $10,000 WORTH OF KASU TOKENS AT LAUNCH PRICE!*{' '}
          <Typography variant='inherit' color='white' display='inline'>
            Every entry gets you $50 worth of free KASU tokens*
          </Typography>
        </Typography>
        <Typography variant='baseXs' color='gray.middle'>
          Entry is based on every 5,000 USDC of lending within a single epoch.
          Loans must be held for at least 90 days. See *
          <Typography
            variant='baseXs'
            color='gold.dark'
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              window.open(
                'https://docs.kasu.finance/usdkasu-kingship-token-airdrop-promotion-terms-and-conditions',
                '_blank'
              )
            }}
          >
            Terms & Conditions.
          </Typography>
        </Typography>
      </Stack>
    </WaveBox>
  )
}

export default PromoBanner
