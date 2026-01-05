'use client'

import { Stack, Typography } from '@mui/material'
import Image from 'next/image'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import RedirectHandler from '@/components/atoms/RedirectHandler'

import { Routes } from '@/config/routes'
import Cat from '@/images/cat.png'

const NotFound = () => (
  <LiteModeRenderer
    renderOnLiteMode={<RedirectHandler to={Routes.lending.root.url} />}
    otherwise={
      <Stack mt={20} alignItems='center'>
        <Image src={Cat} alt='Cat' style={{ width: 548, height: 'auto' }} />
        <Typography variant='h3' color='gray.extraDark'>
          Page not found.
        </Typography>
      </Stack>
    }
  />
)

export default NotFound
