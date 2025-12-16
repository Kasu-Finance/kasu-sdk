/* eslint-disable @next/next/no-img-element */
import { Box, Container } from '@mui/material'
import React from 'react'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import FooterBg from '@/components/organisms/footer/FooterBg'
import FooterLiteLayout from '@/components/organisms/footer/FooterLiteLayout'
import FooterProLayout from '@/components/organisms/footer/FooterProLayout'

const Footer: React.FC = () => {
  return (
    <Box component='footer'>
      <Box
        width='100%'
        position='relative'
        display='flex'
        alignItems={{ xs: 'stretch', md: 'end' }}
        flexDirection={{ xs: 'column', md: 'row' }}
        minHeight={{ md: 418 }}
        pb={{ xs: 4, md: 6 }}
        pt={{ xs: 4, md: 0 }}
      >
        <FooterBg />
        <Container
          maxWidth='lg'
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'end' },
            gap: { xs: 4, md: 0 },
          }}
        >
          <LiteModeRenderer
            renderOnLiteMode={<FooterLiteLayout />}
            otherwise={<FooterProLayout />}
          />
        </Container>
      </Box>
    </Box>
  )
}

export default Footer
