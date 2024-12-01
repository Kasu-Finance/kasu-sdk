'use client'

import { Box, Button } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import usePortfolioState from '@/hooks/context/usePortfolioState'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import getTranslation from '@/hooks/useTranslation'

type LendingPortfolioTableFilterProps = {
  poolOverviews: PoolOverview[]
  currentEpoch: string
}

const LendingPortfolioTableFilter: React.FC<
  LendingPortfolioTableFilterProps
> = ({ poolOverviews, currentEpoch }) => {
  const { t } = getTranslation()

  const { portfolioLendingPools, isLoading } = useLendingPortfolioData(
    poolOverviews,
    currentEpoch
  )

  const { filter, setFilter } = usePortfolioState()

  if (isLoading || !portfolioLendingPools?.length) {
    return null
  }

  return (
    <Box bgcolor='black' display='flex' p={1} gap={1} borderRadius={30}>
      <Button
        variant='contained'
        sx={{
          borderRadius: 'inherit',
          width: 96,
          bgcolor: !filter.activePools ? 'gray.extraDark' : undefined,
        }}
        onClick={() => setFilter('activePools')}
      >
        {t('general.active')}
      </Button>
      <Button
        variant='contained'
        sx={{
          borderRadius: 'inherit',
          width: 96,
          bgcolor: !filter.closedPools ? 'gray.extraDark' : undefined,
        }}
        onClick={() => setFilter('closedPools')}
      >
        {t('general.closed')}
      </Button>
    </Box>
  )
}

export default LendingPortfolioTableFilter
