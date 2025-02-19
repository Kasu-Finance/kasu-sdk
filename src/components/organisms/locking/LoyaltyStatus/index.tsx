import { Grid2, Stack } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CurrentLoyaltyMascot from '@/components/atoms/CurrentLoyaltyMascot'
import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import ApyBonusBreakdown from '@/components/organisms/locking/LoyaltyStatus/ApyBonusBreakdown'
import CurrentLoyaltyDescription from '@/components/organisms/locking/LoyaltyStatus/CurrentLoyaltyDescription'
import CurrentLoyaltyProgressDetails from '@/components/organisms/locking/LoyaltyStatus/CurrentLoyaltyProgressDetails'
import FeesEarnedBreakdown from '@/components/organisms/locking/LoyaltyStatus/FeesEarnedBreakdown'
import LaunchBonusBreakdown from '@/components/organisms/locking/LoyaltyStatus/LaunchBonusBreakdown'

const LoyaltyStatus = () => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('locking.widgets.loyalty.title')} />
      <CustomInnerCardContent sx={{ pb: 3, pt: 5 }}>
        <Stack spacing={6}>
          <Grid2 container spacing={4}>
            <Grid2 size={4}>
              <CurrentLoyaltyDescription />
            </Grid2>
            <Grid2
              size={4}
              display='flex'
              sx={{
                img: {
                  mt: 'auto',
                },
              }}
            >
              <CurrentLoyaltyMascot />
            </Grid2>
            <Grid2 size={4} display='flex'>
              <CurrentLoyaltyProgressDetails />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={4}>
            <Grid2 size={4}>
              <ApyBonusBreakdown />
            </Grid2>
            <Grid2 size={4}>
              <LaunchBonusBreakdown />
            </Grid2>
            <Grid2 size={4}>
              <FeesEarnedBreakdown />
            </Grid2>
          </Grid2>
        </Stack>
      </CustomInnerCardContent>
    </CustomCard>
  )
}
export default LoyaltyStatus
