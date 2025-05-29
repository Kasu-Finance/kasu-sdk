import { Box, Button, Container, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'

import DiscordIcon from '@/assets/icons/general/DiscordIcon'
import MediumIcon from '@/assets/icons/general/MediumIcon'
import TelegramIcon from '@/assets/icons/general/TelegramIcon'
import TwitterIcon from '@/assets/icons/general/TwitterIcon'
import BuiltOnBase from '@/assets/logo/BuildOnBaseLogo'
import KasuFooterLogo from '@/assets/logo/KasuFooterLogo'

import FooterBg from '@/images/footer-background.png'

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
            maxHeight: 343,
          }}
          priority
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
              <Box display='flex' gap={4} mt='auto'>
                <Button
                  href='https://discord.gg/kasu'
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{ width: 'max-content', height: 'max-content', p: 0 }}
                >
                  <DiscordIcon />
                </Button>
                <Button
                  href='https://t.me/KASU_Fi'
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{ width: 'max-content', height: 'max-content', p: 0 }}
                >
                  <TelegramIcon />
                </Button>
                <Button
                  href='https://medium.com/@KasuFinance'
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{ width: 'max-content', height: 'max-content', p: 0 }}
                >
                  <MediumIcon />
                </Button>
                <Button
                  href='https://twitter.com/KasuFinance'
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{ width: 'max-content', height: 'max-content', p: 0 }}
                >
                  <TwitterIcon />
                </Button>
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
                  textTransform: 'capitalize',
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
