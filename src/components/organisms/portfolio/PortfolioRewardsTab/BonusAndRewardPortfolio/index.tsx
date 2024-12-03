import { Button, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import BonusAndRewardTable from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardTable'

import { DownloadRoundedIcon } from '@/assets/icons'

const BonusAndRewardPortfolio = () => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('portfolio.rewards.title-2')}
        justifyContent='space-between'
      >
        <Button
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
        </Button>
      </CustomCardHeader>
      <CustomInnerCardContent sx={{ p: 0 }}>
        <BonusAndRewardTable />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default BonusAndRewardPortfolio
