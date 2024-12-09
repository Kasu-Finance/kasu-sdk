import { Box, Stack } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import WaveBox from '@/components/atoms/WaveBox'
import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'
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
    <Stack spacing={3}>
      <WaveBox variant='gray' borderRadius={2}>
        <NextClearingPeriodInfo
          beforeText={t('portfolio.lendingPortfolio.dataUpdateTime')}
          sx={{
            bgcolor: 'unset',
            textAlign: 'start',
          }}
          typographyProps={{
            variant: 'baseSm',
          }}
          timeTypographyProps={{
            variant: 'baseSmBold',
            display: 'inline-block',
          }}
          skeletonProps={{
            sx: {
              bgcolor: 'rgba(40, 40, 42, 0.11)',
            },
          }}
        />
      </WaveBox>
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
    </Stack>
  )
}

export default Portfolio
