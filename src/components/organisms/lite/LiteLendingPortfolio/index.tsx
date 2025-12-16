'use client'

import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { Grid2, Stack, Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import LiteModeSkeleton from '@/components/atoms/LiteModeSkeleton'
import WaveBox from '@/components/atoms/WaveBox'
import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'
import LiteLendingPortfolioChart from '@/components/organisms/lite/LiteLendingPortfolio/LiteLendingPortfolioChart'
import LiteLendingPortfolioTableBody from '@/components/organisms/lite/LiteLendingPortfolio/LiteLendingPortfolioTableBody'
import LiteLendingPortfolioTableHeader from '@/components/organisms/lite/LiteLendingPortfolio/LiteLendingPortfolioTableHeader'

type LiteLendingPortfolioProps = {
  portfolioLendingPools?: PortfolioLendingPool[]
  isLoading?: boolean
  isAuthenticated?: boolean
}

const LiteLendingPortfolio: React.FC<LiteLendingPortfolioProps> = ({
  portfolioLendingPools: portfolioLendingPoolsFromProps,
  isLoading: isLoadingFromProps,
  isAuthenticated: isAuthenticatedFromProps,
}) => {
  const { t } = getTranslation()

  const { isAuthenticated: isAuthenticatedFromHook } = usePrivyAuthenticated()

  const isAuthenticated = isAuthenticatedFromProps ?? isAuthenticatedFromHook
  const isPortfolioLoading = isLoadingFromProps ?? false
  const lendingPortfolioPools = portfolioLendingPoolsFromProps

  if (!isAuthenticated) return null

  const showSkeleton = isPortfolioLoading
  const showEmpty = !showSkeleton && !lendingPortfolioPools?.length

  return (
    <WaveBox variant='dark-middle' borderRadius={4} p={2}>
      <Stack spacing={3}>
        <Typography variant='h4' color='white'>
          {t('lite.lendingPortfolio.title')}
        </Typography>
        {showSkeleton ? (
          <Stack spacing={2}>
            <LiteModeSkeleton height={28} width='45%' variant='rounded' />
            {[1, 2, 3, 4].map((row) => (
              <LiteModeSkeleton
                key={row}
                height={44}
                variant='rounded'
                width='100%'
              />
            ))}
          </Stack>
        ) : showEmpty ? (
          <EmptyDataPlaceholder
            text='You have no active deposits yet.'
            textProps={{ color: 'white' }}
          />
        ) : (
          (() => {
            const poolsData = lendingPortfolioPools as PortfolioLendingPool[]

            return (
              <Grid2 container spacing={{ xs: 2, md: 2 }}>
                <Grid2 size={{ xs: 12, md: 9.5 }} sx={{ minWidth: 0 }}>
                  <LiteModeTable
                    tableHeader={<LiteLendingPortfolioTableHeader />}
                    tableBody={
                      <LiteLendingPortfolioTableBody
                        portfolioLendingPools={poolsData}
                      />
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2.5 }} sx={{ minWidth: 0 }}>
                  <LiteLendingPortfolioChart
                    portfolioLendingPools={poolsData}
                  />
                </Grid2>
              </Grid2>
            )
          })()
        )}
      </Stack>
    </WaveBox>
  )
}

export default LiteLendingPortfolio
