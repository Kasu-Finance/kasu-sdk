import { Box, Link, Stack, Typography } from '@mui/material'
import React from 'react'

import DiscordIcon from '@/assets/icons/general/DiscordIcon'
import MediumIcon from '@/assets/icons/general/MediumIcon'
import TelegramIcon from '@/assets/icons/general/TelegramIcon'
import TwitterIcon from '@/assets/icons/general/TwitterIcon'
import KasuBlack from '@/assets/logo/KasuBlack'

const PageFooter: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        mt: 10,
      }}
    >
      <KasuBlack />
      <Typography variant='body1'>
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
      <Stack direction='row' spacing={2}>
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

export default PageFooter
