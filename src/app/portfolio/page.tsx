import { Box, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CsvDownloadButton from '@/components/organisms/portfolio/LendingPortfolioTab/CsvDownloadButton'
import LendingPortfolioTableFilter from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableFilter'
import LendingPortfolioTableWrapper from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableWrapper'

import { getPoolOverview } from '@/app/_requests/pools'

const Portfolio = async () => {
  const pools = await getPoolOverview()

  const { t } = useTranslation()

  return (
    <CustomCard sx={{ pt: 1 }}>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        px={2}
        mb={1}
      >
        <Box display='flex' alignItems='center' height={64}>
          <Typography variant='h3' color='gold.darkNoises'>
            {t('portfolio.lendingPortfolio.title')}
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap={1}>
          <LendingPortfolioTableFilter poolOverviews={pools} />
          <CsvDownloadButton poolOverviews={pools} />
        </Box>
      </Box>
      <CustomInnerCardContent sx={{ p: 0 }}>
        <LendingPortfolioTableWrapper poolOverviews={pools} />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default Portfolio
