import { Box, Link, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'

import DiscordIcon from '@/assets/icons/general/DiscordIcon'
import MediumIcon from '@/assets/icons/general/MediumIcon'
import TelegramIcon from '@/assets/icons/general/TelegramIcon'
import TwitterIcon from '@/assets/icons/general/TwitterIcon'
import KasuFooterLogo from '@/assets/logo/KasuFooterLogo'

import FooterBg from '@/images/footer-background.png'

const Footer: React.FC = () => {
  return (
    <Box component='footer'>
      <Box
        width='100%'
        position='relative'
        display='flex'
        flexDirection='column'
        justifyContent='end'
        alignItems='center'
        height={250}
      >
        <Image
          src={FooterBg}
          alt='footer background'
          style={{
            position: 'absolute',
            zIndex: -1,
            bottom: 0,
            right: 0,
            width: '100vw',
            height: 'auto',
            maxHeight: 300,
          }}
          priority
        />
        <KasuFooterLogo />
        <Typography variant='body1' mt={2}>
          <Link
            sx={{
              color: 'primary',
              textShadow: '0px 0px 8px rgba(0, 0, 0, 0.8)',
            }}
            href='mailto:hello@kasu.finance'
          >
            hello@kasu.finance
          </Link>
        </Typography>
      </Box>
      <Stack
        direction='row'
        spacing={2}
        pt={2}
        height={78}
        bgcolor='primary.contrastText'
        width='100%'
        justifyContent='center'
      >
        <a
          href='https://discord.gg/jm2V7vUg99'
          target='_blank'
          rel='noopener noreferrer'
        >
          <DiscordIcon />
        </a>
        <a
          href='https://t.me/KASU_Fi'
          target='_blank'
          rel='noopener noreferrer'
        >
          <TelegramIcon />
        </a>
        <a
          href='https://medium.com/@KasuFinance'
          target='_blank'
          rel='noopener noreferrer'
        >
          <MediumIcon />
        </a>
        <a
          href='https://twitter.com/KasuFinance'
          target='_blank'
          rel='noopener noreferrer'
        >
          <TwitterIcon />
        </a>
      </Stack>
    </Box>
  )
}

export default Footer
