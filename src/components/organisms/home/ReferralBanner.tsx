'use client'

import { Box, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'

import NextLink from '@/components/atoms/NextLink'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'

const ReferralBanner = () => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.REFERRAL })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpen()
    }
  }

  return (
    <Box
      bgcolor='dark'
      borderRadius={2}
      px={{ xs: 1.5, md: 2 }}
      py={{ xs: 2, md: 2 }}
      mb={2}
      role='button'
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      sx={{
        cursor: 'pointer',
        transition: 'background-color 150ms ease, box-shadow 150ms ease',
        '&:hover': {
          backgroundColor: 'gray.extraDark',
          boxShadow: '0 0 0 1px rgba(196, 153, 108, 0.5)',
        },
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1, md: 2.5 }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Typography
            variant='h4'
            color='gold.dark'
            sx={{ fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.1 }}
          >
            REFER AND EARN TODAY
          </Typography>
          <Typography
            variant='h6'
            color='white'
            sx={{ fontWeight: 500, lineHeight: 1.3 }}
          >
            Refer a Friend -&gt; Split a 10% Interest Boost
          </Typography>
        </Stack>
        <Typography variant='baseSm' color='grey.200'>
          Eligibility conditions apply. Refer to{' '}
          <NextLink
            href={Routes.lending.termsAndConditions.url}
            variant='baseSmBold'
            sx={{ color: 'gold.dark', textDecoration: 'underline' }}
          >
            Terms & Conditions
          </NextLink>
          .
        </Typography>
      </Stack>
    </Box>
  )
}

export default ReferralBanner
