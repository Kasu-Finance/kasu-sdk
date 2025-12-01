'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { Grid2, Stack, Typography } from '@mui/material'
import React from 'react'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import WaveBox from '@/components/atoms/WaveBox'
import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'
import LiteLendingPortfolioChart from '@/components/organisms/lite/LiteLendingPortfolio/LiteLendingPortfolioChart'
import LiteLendingPortfolioTableBody from '@/components/organisms/lite/LiteLendingPortfolio/LiteLendingPortfolioTableBody'
import LiteLendingPortfolioTableHeader from '@/components/organisms/lite/LiteLendingPortfolio/LiteLendingPortfolioTableHeader'

type LiteLendingPortfolioProps = {
  pools: PoolOverview[]
  currentEpoch: string
  portfolioLendingPools?: PortfolioLendingPool[]
  isLoading?: boolean
  isAuthenticated?: boolean
}

const LiteLendingPortfolio: React.FC<LiteLendingPortfolioProps> = ({
  currentEpoch,
  pools,
  portfolioLendingPools: portfolioLendingPoolsFromProps,
  isLoading: isLoadingFromProps,
  isAuthenticated: isAuthenticatedFromProps,
}) => {
  const { t } = getTranslation()

  const { isAuthenticated: isAuthenticatedFromHook } = usePrivyAuthenticated()

  const { portfolioLendingPools, isLoading } = useLendingPortfolioData(
    pools,
    currentEpoch
  )

  const isAuthenticated = isAuthenticatedFromProps ?? isAuthenticatedFromHook
  const isPortfolioLoading = isLoadingFromProps ?? isLoading
  const lendingPortfolioPools =
    portfolioLendingPoolsFromProps ?? portfolioLendingPools

  if (!isAuthenticated || isPortfolioLoading || !lendingPortfolioPools?.length)
    return null

  return (
    <WaveBox variant='dark-middle' borderRadius={4} p={2}>
      <Stack spacing={3}>
        <Typography variant='h4' color='white'>
          {t('lite.lendingPortfolio.title')}
        </Typography>
        <Grid2 container spacing={2}>
          <Grid2 size={9.5}>
            <LiteModeTable
              tableHeader={<LiteLendingPortfolioTableHeader />}
              tableBody={
                <LiteLendingPortfolioTableBody
                  portfolioLendingPools={lendingPortfolioPools}
                />
              }
            />
          </Grid2>
          <Grid2 size={2.5}>
            <LiteLendingPortfolioChart
              portfolioLendingPools={lendingPortfolioPools}
            />
          </Grid2>
        </Grid2>
      </Stack>
    </WaveBox>
  )
}

export default LiteLendingPortfolio
