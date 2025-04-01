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
          KASU TOKEN AIRDROP AT LAUNCH PRICE!{' '}
          <Typography variant='inherit' color='white' display='inline'>
            Receive 50 USDC worth of free KASU tokens for every 5,000 USDC of
            lending
          </Typography>
        </Typography>
        <Typography variant='baseMd' color='gray.middle'>
          Loans must held for at least 90 days. KASU tokens will be airdropped
          to your wallet 90 days post launch.
        </Typography>
      </Stack>
    </WaveBox>
  )
}

export default PromoBanner
