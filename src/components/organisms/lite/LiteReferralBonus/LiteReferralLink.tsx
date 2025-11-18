'use client'

import { Button, Typography } from '@mui/material'

import useReferralLink from '@/hooks/referrals/useReferralLink'

import { CopyIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'

const LiteReferralLink = () => {
  const referralLink = useReferralLink()

  const handleCopy = () => navigator.clipboard.writeText(referralLink.fullUrl)

  return (
    <Typography variant='baseSm' color='white'>
      Use your referral link to invite friends and earn KASU tokens:{' '}
      <Button
        variant='text'
        sx={{
          textTransform: 'unset',
          display: 'inline-flex',
          alignItems: 'center',
          p: 0,
          height: 15,
          mt: -0.3,
          ...customTypography.baseSm,
          '.MuiButton-endIcon svg': {
            width: 13,
            height: 'auto',
            path: {
              fill: customPalette.gold.dark,
            },
          },
        }}
        onClick={handleCopy}
        endIcon={<CopyIcon />}
      >
        <Typography variant='inherit'>Copy your referral link</Typography>
      </Button>
    </Typography>
  )
}

export default LiteReferralLink
