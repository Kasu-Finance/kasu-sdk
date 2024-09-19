import { Box, Button, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import BonusAndRewardTable from '@/components/organisms/portfolio/PortfolioRewardsTab/BonusAndRewardPortfolio/BonusAndRewardTable'

import { DownloadRoundedIcon } from '@/assets/icons'

const BonusAndRewardPortfolio = () => {
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
            {t('portfolio.rewards.title-2')}
          </Typography>
        </Box>
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
      </Box>
      <CustomInnerCardContent sx={{ p: 0 }}>
        <BonusAndRewardTable />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default BonusAndRewardPortfolio
