import { Box, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import ApiCsvDownloadButton from '@/components/atoms/ApiCsvDownloadButton'
import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import Airdrops from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/Airdrops'
import BonusAndRewardTable from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardTable'
import NftPortfolio from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/NftPortfolio'
import ReferralBonus from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/ReferralBonus'

import { DownloadRoundedIcon } from '@/assets/icons'

const BonusAndRewardPortfolio = () => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('portfolio.rewards.title-2')}
        justifyContent='space-between'
      >
        <ApiCsvDownloadButton
          kind='rewards'
          variant='text'
          endIcon={<DownloadRoundedIcon />}
          sx={{ textTransform: 'unset' }}
        >
          <Typography
            variant='inherit'
            sx={{ '&::first-letter': { textTransform: 'capitalize' } }}
            display='block'
          >
            {t('general.csvDownload')}
          </Typography>
        </ApiCsvDownloadButton>
      </CustomCardHeader>
      <CustomInnerCardContent
        sx={{
          p: 0,
          background: `#F4F4F4 url("/images/wave-middle-gray.png") repeat`,
        }}
      >
        <Stack>
          <Box>
            <Typography
              variant='h4'
              color='rgba(205, 163, 112, 1)'
              px={2}
              py={2.3}
            >
              {t('portfolio.rewards.subheader-1.title')}
            </Typography>
            <BonusAndRewardTable />
          </Box>
          <Box>
            <Typography
              variant='h4'
              color='rgba(205, 163, 112, 1)'
              px={2}
              py={2.3}
            >
              {t('portfolio.rewards.subheader-2.title')}
            </Typography>
            <NftPortfolio />
          </Box>
          <Box>
            <Typography
              variant='h4'
              color='rgba(205, 163, 112, 1)'
              px={2}
              py={2.3}
            >
              {t('portfolio.rewards.subheader-3.title')}
            </Typography>
            <ReferralBonus />
          </Box>
          <Box>
            <Airdrops />
          </Box>
        </Stack>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default BonusAndRewardPortfolio
