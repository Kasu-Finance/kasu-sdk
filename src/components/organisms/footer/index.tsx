/* eslint-disable @next/next/no-img-element */
import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'

import DiscordIcon from '@/assets/icons/general/DiscordIcon'
import MediumIcon from '@/assets/icons/general/MediumIcon'
import TelegramIcon from '@/assets/icons/general/TelegramIcon'
import TwitterIcon from '@/assets/icons/general/TwitterIcon'
import BuiltOnBase from '@/assets/logo/BuildOnBaseLogo'
import KasuFooterLogo from '@/assets/logo/KasuFooterLogo'

import FooterBg from '@/images/footer-background.png'
import { customPalette } from '@/themes/palette'

const Footer: React.FC = () => {
  return (
    <Box component='footer'>
      <Box
        width='100%'
        position='relative'
        display='flex'
        alignItems='end'
        height={350}
        pb={6}
      >
        <img
          src={FooterBg.src}
          alt='footer background'
          style={{
            position: 'absolute',
            zIndex: -1,
            bottom: 0,
            right: 0,
            width: '100vw',
            height: '100%',
            maxHeight: 343,
          }}
        />
        <Container
          maxWidth='lg'
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Box display='flex' gap={8}>
            <Stack>
              <Box display='flex' gap={2} alignItems='center'>
                <KasuFooterLogo />
                <BuiltOnBase />
              </Box>
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
            </Stack>
            <Box
              display='grid'
              gridTemplateColumns='repeat(2, 160px)'
              gridTemplateRows='max-content'
              rowGap={1}
              mt='auto'
            >
              <Button
                href='https://docs.kasu.finance/'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  width: 'max-content',
                  height: 'max-content',
                  p: 0,
                  textTransform: 'capitalize',
                }}
              >
                User Docs
              </Button>
              <Button
                href='https://docs.kasu.finance/important-information-when-lending/frequently-asked-questions'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  width: 'max-content',
                  height: 'max-content',
                  p: 0,
                  textTransform: 'capitalize',
                }}
              >
                FAQs
              </Button>
              <Button
                href='https://kasu.finance/'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  width: 'max-content',
                  height: 'max-content',
                  p: 0,
                  textTransform: 'capitalize',
                }}
              >
                Website
              </Button>
              <Button
                href='mailto:hello@kasu.finance'
                rel='noopener noreferrer'
                sx={{
                  width: 'max-content',
                  height: 'max-content',
                  p: 0,
                  textTransform: 'capitalize',
                }}
              >
                Contact Us
              </Button>
            </Box>
          </Box>

          <Box
            display='grid'
            gridTemplateColumns='repeat(auto-fill, 160px)'
            rowGap={1}
            width={320}
          >
            <Stack spacing={1}>
              <Typography variant='baseMdBold' color='white'>
                Legal Notices:
              </Typography>

              <Button
                href='https://docs.kasu.finance/legal-notices/privacy-policy'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  width: 'max-content',
                  height: 'max-content',
                  p: 0,
                  textTransform: 'capitalize',
                }}
              >
                Privacy Policy
              </Button>
              <Button
                href='https://docs.kasu.finance/legal-notices/platform-access-and-use-terms-of-use'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  width: 'max-content',
                  height: 'max-content',
                  p: 0,
                  textTransform: 'unset',
                }}
              >
                Terms of Use
              </Button>
            </Stack>
            <Stack spacing={1}>
              <Typography variant='baseMdBold' color='white'>
                Platform Disclosures:
              </Typography>
              <Button
                href='https://docs.kasu.finance/important-information-when-lending/important-information'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  width: 'max-content',
                  height: 'max-content',
                  p: 0,
                  textTransform: 'capitalize',
                }}
              >
                Important Information
              </Button>
              <Button
                href='https://docs.kasu.finance/risk-warnings/risk-warnings'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  width: 'max-content',
                  height: 'max-content',
                  p: 0,
                  textTransform: 'capitalize',
                }}
              >
                Risk Warning
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Footer
