import { Box } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CsvDownloadButton from '@/components/organisms/portfolio/LendingPortfolioTab/CsvDownloadButton'
import LendingPortfolioTableFilter from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableFilter'
import LendingPortfolioTableWrapper from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableWrapper'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolOverview } from '@/app/_requests/pools'

const Portfolio = async () => {
  const [pools, currentEpoch] = await Promise.all([
    getPoolOverview(),
    getCurrentEpoch(),
  ])

  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('portfolio.lendingPortfolio.title')}
        justifyContent='space-between'
      >
        <Box display='flex' alignItems='center' gap={1}>
          <LendingPortfolioTableFilter
            poolOverviews={pools}
            currentEpoch={currentEpoch}
          />
          <CsvDownloadButton
            poolOverviews={pools}
            currentEpoch={currentEpoch}
          />
        </Box>
      </CustomCardHeader>
      <CustomInnerCardContent sx={{ p: 0 }}>
        <LendingPortfolioTableWrapper
          poolOverviews={pools}
          currentEpoch={currentEpoch}
        />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default Portfolio
