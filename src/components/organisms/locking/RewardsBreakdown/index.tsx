import { Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import ApyBonusBreakdown from '@/components/organisms/locking/RewardsBreakdown/ApyBonusBreakdown'
import FeesEarnedBreakdown from '@/components/organisms/locking/RewardsBreakdown/FeesEarnedBreakdown'
import LaunchBonusBreakdown from '@/components/organisms/locking/RewardsBreakdown/LaunchBonusBreakdown'

const RewardsBreakdown = () => {
  const { t } = useTranslation()
  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('locking.widgets.rewardsBreakdown.title')}
      </Typography>
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <ApyBonusBreakdown />
          </Grid>
          <Grid item xs={4}>
            <LaunchBonusBreakdown />
          </Grid>
          <Grid item xs={4}>
            <FeesEarnedBreakdown />
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default RewardsBreakdown
