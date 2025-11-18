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
        alignItems='end'
        height={418}
        pb={6}
      >
        <FooterBg />
        <Container
          maxWidth='lg'
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
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
