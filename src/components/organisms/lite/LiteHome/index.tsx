'use client'

import { Grid2, Stack, Typography } from '@mui/material'
import { redirect } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import KasuIntroVideo from '@/components/organisms/lite/LiteHome/KasuIntroVideo'
import LiteHomePool from '@/components/organisms/lite/LiteHome/LiteHomePool'

import { Routes } from '@/config/routes'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteHomeProps = {
  currentEpoch: string
  pools: PoolOverviewWithDelegate[]
}

const LiteHome: React.FC<LiteHomeProps> = ({ pools, currentEpoch }) => {
  const [initialDeposit, setInitialDeposit] = useState<boolean | undefined>()

  useEffect(() => {
    if (
      typeof localStorage !== 'undefined' &&
      typeof initialDeposit === 'undefined'
    ) {
      const initialState = localStorage.getItem('KASU_INITIAL_DEPOSIT')

      if (!initialState) {
        localStorage.setItem('KASU_INITIAL_DEPOSIT', 'false')
        setInitialDeposit(false)
        return
      }

      setInitialDeposit(initialState === 'true')
    }
  }, [initialDeposit])

  if (typeof initialDeposit === 'undefined') {
    return null
  }

  return initialDeposit ? (
    redirect(Routes.portfolio.root.url)
  ) : (
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
    </Stack>
  )
}

export default LiteHome
