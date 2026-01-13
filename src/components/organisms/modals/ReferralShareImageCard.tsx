import { Box, Typography } from '@mui/material'
import { forwardRef } from 'react'

import KasuHorizontalGoldWhite from '@/assets/logo/KasuHorizontalGoldWhite'

type ReferralShareImageCardProps = {
  headline: string
  trancheLabel?: string
  apyPercent?: string
  referralUrl: string
  overlayImageSrc?: string
}

const ReferralShareImageCard = forwardRef<
  HTMLDivElement,
  ReferralShareImageCardProps
>(
  (
    { headline, trancheLabel, apyPercent, referralUrl, overlayImageSrc },
    ref
  ) => (
    <Box
      ref={ref}
      borderRadius={3}
      position='relative'
      overflow='hidden'
      sx={{
        width: 'min(560px, 100%)',
        aspectRatio: '16 / 9',
        backgroundImage: `url('/images/lite-mode-background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background:
            'linear-gradient(135deg, rgba(40,40,42,0.68) 0%, rgba(40,40,42,0.48) 45%, rgba(40,40,42,0.68) 100%)',
        }}
      />
      {overlayImageSrc ? (
        <Box
          component='img'
          src={overlayImageSrc}
          alt=''
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-40%)',
            height: '88%',
            width: 'auto',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1,
          }}
        />
      ) : null}
      <Box
        position='relative'
        height='100%'
        display='flex'
        flexDirection='column'
        p={2.5}
        zIndex={3}
      >
        <Box
          display='flex'
          justifyContent='flex-start'
          alignItems='flex-start'
          sx={{ mt: -1.25 }}
        >
          <KasuHorizontalGoldWhite height={80} />
        </Box>

        <Box
          flex={1}
          display='flex'
          flexDirection='column'
          justifyContent='center'
        >
          <Typography
            sx={{
              color: 'white',
              fontWeight: 800,
              fontSize: 'clamp(22px, 3.5vw, 34px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {headline}
          </Typography>
          {trancheLabel ? (
            <Typography
              sx={{
                mt: 1.1,
                color: 'rgba(247, 241, 229, 1)',
                fontWeight: 800,
                fontSize: 'clamp(15px, 2.4vw, 22px)',
              }}
            >
              {trancheLabel}
            </Typography>
          ) : null}
          {apyPercent ? (
            <Typography
              sx={{
                mt: 0.5,
                color: 'rgba(247, 241, 229, 1)',
                fontWeight: 800,
                fontSize: 'clamp(15px, 2.4vw, 22px)',
              }}
            >
              <Box component='span' sx={{ fontWeight: 900 }}>
                {apyPercent}
              </Box>{' '}
              APY
            </Typography>
          ) : null}
        </Box>

        <Box
          sx={{
            borderTop: '1px solid rgba(232, 192, 145, 0.35)',
            pt: 1.5,
          }}
        >
          <Typography
            sx={{
              color: 'rgba(205, 206, 208, 1)',
              fontSize: 12,
              mb: 0.25,
            }}
          >
            Referral link:
          </Typography>
          <Typography
            sx={{
              color: 'white',
              fontSize: 12,
              fontWeight: 700,
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              lineHeight: 1.25,
            }}
          >
            {referralUrl}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
)

ReferralShareImageCard.displayName = 'ReferralShareImageCard'

export default ReferralShareImageCard
