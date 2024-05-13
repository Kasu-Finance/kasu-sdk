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
            color: 'text.primary',
          }}
          href='mailto:hello@kasu.finance'
        >
          hello@kasu.finance
        </Link>
      </Typography>
      <Stack direction='row' spacing={2}>
        <a href='https://discord.com' target='_blank' rel='noopener noreferrer'>
          <DiscordIcon />
        </a>
        <a href='https://t.me' target='_blank' rel='noopener noreferrer'>
          <TelegramIcon />
        </a>
        <a href='https://medium.com' target='_blank' rel='noopener noreferrer'>
          <MediumIcon />
        </a>
        <a href='https://twitter.com' target='_blank' rel='noopener noreferrer'>
          <TwitterIcon />
        </a>
      </Stack>
    </Box>
  )
}

export default PageFooter
