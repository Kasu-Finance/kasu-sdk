'use client'

import { Grid2, Stack, Typography } from '@mui/material'
import React from 'react'

import KasuIntroVideo from '@/components/organisms/lite/LiteHome/KasuIntroVideo'
import LiteHomePool from '@/components/organisms/lite/LiteHome/LiteHomePool'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteHomeProps = {
  currentEpoch: string
  pools: PoolOverviewWithDelegate[]
}

const LiteHome: React.FC<LiteHomeProps> = ({ pools, currentEpoch }) => {
  return (
    <Stack>
      <Typography
        variant='h1'
        fontWeight={300}
        fontSize={58}
        letterSpacing={-1}
        color='white'
        textAlign='center'
        mt={-11}
      >
        REDEFINING REAL-WORLD YIELD
      </Typography>
      <Typography
        variant='h3'
        fontWeight={400}
        color='gold.dark'
        textAlign='center'
        mt={5}
      >
        Real businesses. Trusted lending partners. Proven tack track record.
      </Typography>
      <Typography variant='baseLg' color='white' textAlign='center' mt={1}>
        Our partner Apxium has issued over $3B in loans with no losses in 8
        years.
      </Typography>
      <Grid2 container spacing={8} mt={5}>
        {pools.map((pool) => (
          <LiteHomePool key={pool.id} pool={pool} currentEpoch={currentEpoch} />
        ))}
      </Grid2>
      <KasuIntroVideo />
      <Typography
        variant='h3'
        fontWeight={400}
        color='gold.dark'
        textAlign='center'
      >
        Built on Base · KYC required
      </Typography>
    </Stack>
  )
}

export default LiteHome
