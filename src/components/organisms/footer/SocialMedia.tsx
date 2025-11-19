/* eslint-disable @next/next/no-img-element */
import { Box, IconButton } from '@mui/material'

import DiscordIcon from '@/assets/icons/general/DiscordIcon'
import MediumIcon from '@/assets/icons/general/MediumIcon'
import TelegramIcon from '@/assets/icons/general/TelegramIcon'
import TwitterIcon from '@/assets/icons/general/TwitterIcon'

import { customPalette } from '@/themes/palette'

const SocialMedia = () => (
  <Box
    display='flex'
    gap={4}
    mt='auto'
    sx={{
      '.MuiIconButton-root': {
        p: 0,

        '&::before': {
          borderRadius: '50%',
          height: 'calc(100% + 4px)',
        },

        'svg path': {
          transition: 'fill 0.3s ease',
        },

        '&:hover svg path': {
          fill: customPalette.gold.extraDark,
        },
      },
    }}
  >
    <IconButton
      href='https://discord.gg/kasu'
      target='_blank'
      rel='noopener noreferrer'
    >
      <DiscordIcon />
    </IconButton>
    <IconButton
      href='https://t.me/KASU_Fi'
      target='_blank'
      rel='noopener noreferrer'
    >
      <TelegramIcon />
    </IconButton>
    <IconButton
      href='https://medium.com/@KasuFinance'
      target='_blank'
      rel='noopener noreferrer'
    >
      <MediumIcon />
    </IconButton>
    <IconButton
      href='https://twitter.com/KasuFinance'
      target='_blank'
      rel='noopener noreferrer'
    >
      <TwitterIcon />
    </IconButton>
  </Box>
)

export default SocialMedia
