'use client'

import { Box, Button } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import usePortfolioState from '@/hooks/context/usePortfolioState'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import useTranslation from '@/hooks/useTranslation'

type LendingPortfolioTableFilterProps = {
  poolOverviews: PoolOverview[]
}

const LendingPortfolioTableFilter: React.FC<
  LendingPortfolioTableFilterProps
> = ({ poolOverviews }) => {
  const { t } = useTranslation()

  const { lendingPortfolioData, isLoading } =
    useLendingPortfolioData(poolOverviews)

  const { filter, setFilter } = usePortfolioState()

  if (isLoading || !lendingPortfolioData?.lendingPools.length) {
    return null
  }

  return (
    <Box bgcolor='black' display='flex' p={1} gap={1} borderRadius={30}>
      <Button
        variant='contained'
        sx={{
          borderRadius: 'inherit',
          width: 96,
          height: 48,
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
          height: 48,
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
