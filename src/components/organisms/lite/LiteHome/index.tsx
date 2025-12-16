'use client'

import { Grid2, Pagination, Stack, Typography } from '@mui/material'
import React from 'react'

import usePagination from '@/hooks/usePagination'

import KasuIntroVideo from '@/components/organisms/lite/LiteHome/KasuIntroVideo'
import LiteHomePool from '@/components/organisms/lite/LiteHome/LiteHomePool'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteHomeProps = {
  currentEpoch: string
  pools: PoolOverviewWithDelegate[]
}

const CARDS_PER_PAGE = 3

const LiteHome: React.FC<LiteHomeProps> = ({ pools, currentEpoch }) => {
  const { currentPage, setPage, paginateData } = usePagination(
    CARDS_PER_PAGE,
    pools.length
  )

  return (
    <Stack>
      <Typography
        variant='h1'
        fontWeight={300}
        fontSize={{ xs: 34, sm: 44, md: 58 }}
        letterSpacing={-1}
        color='white'
        textAlign='center'
        mt={{ xs: 0, md: -2 }}
        px={{ xs: 1, sm: 2, md: 0 }}
      >
        REDEFINING REAL-WORLD YIELD
      </Typography>
      <Typography
        variant='h3'
        fontWeight={400}
        color='gold.dark'
        textAlign='center'
        mt={{ xs: 3, md: 5 }}
        px={{ xs: 1, sm: 2, md: 0 }}
      >
        Real businesses. Trusted lending partners. Proven tack track record.
      </Typography>
      <Typography
        variant='baseLg'
        color='white'
        textAlign='center'
        mt={1}
        px={{ xs: 1, sm: 2, md: 0 }}
      >
        Our partner Apxium has originated over $30M in loans with zero losses
        across its full 8-year operating history.
      </Typography>
      <Grid2
        container
        spacing={{ xs: 4, md: pools.length === 2 ? 27 : 11 }}
        mt={{ xs: 3, md: 5 }}
        justifyContent='space-evenly'
        sx={
          pools.length === 2
            ? {
                px: { xs: 0, md: 18 },
              }
            : null
        }
      >
        {paginateData([...pools], true).map((pool, index, orgArr) => (
          <LiteHomePool
            key={index}
            layoutType={Math.min(orgArr.length, 3) as 1 | 2 | 3}
            pool={pool}
            currentEpoch={currentEpoch}
          />
        ))}
      </Grid2>

      {pools.length > CARDS_PER_PAGE && (
        <Pagination
          color='primary'
          boundaryCount={2}
          siblingCount={0}
          count={Math.ceil(pools.length / CARDS_PER_PAGE)}
          page={currentPage}
          onChange={(_, page) => setPage(page)}
          sx={{
            mt: { xs: 3, md: 5 },
            mx: 'auto',
          }}
        />
      )}
      <KasuIntroVideo />
      <Typography
        variant='h3'
        fontWeight={400}
        color='gold.dark'
        textAlign='center'
        px={{ xs: 1, sm: 2, md: 0 }}
      >
        Built on Base · KYC required
      </Typography>
    </Stack>
  )
}

export default LiteHome
