import { Box, Stack } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import ApiCsvDownloadButton from '@/components/atoms/ApiCsvDownloadButton'
import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import WaveBox from '@/components/atoms/WaveBox'
import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'
import LiteModeApp from '@/components/organisms/lite'
import LendingPortfolioTableFilter from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableFilter'
import LendingPortfolioTableWrapper from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableWrapper'

import { DownloadRoundedIcon } from '@/assets/icons'

import getLockPeriods from '@/actions/getLockPeriods'
import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolOverview } from '@/app/_requests/pools'
import { getPoolWithDelegate } from '@/app/_requests/poolWithDelegate'

const Portfolio = async () => {
  const [poolsWithDelegate, pools, currentEpoch, lockPeriods] =
    await Promise.all([
      getPoolWithDelegate(),
      getPoolOverview(),
      getCurrentEpoch(),
      getLockPeriods(),
    ])

  const { t } = getTranslation()

  return (
    <LiteModeRenderer
      renderOnLiteMode={
        <LiteModeApp
          activePools={poolsWithDelegate}
          pools={pools}
          currentEpoch={currentEpoch}
          lockPeriods={lockPeriods}
        />
      }
      otherwise={
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
                <ApiCsvDownloadButton
                  kind='portfolio-lending'
                  epochId={currentEpoch}
                  variant='text'
                  sx={{
                    maxWidth: 368,
                    mx: 'auto',
                    textTransform: 'capitalize',
                    height: 'auto',
                  }}
                  endIcon={<DownloadRoundedIcon />}
                >
                  {t('general.csvDownload')}
                </ApiCsvDownloadButton>
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
      }
    />
  )
}

export default Portfolio
