import { Grid } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CurrentLoyaltyMascot from '@/components/atoms/CurrentLoyaltyMascot'
import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CurrentLoyaltyDescription from '@/components/organisms/locking/LoyaltyStatus/CurrentLoyaltyDescription'
import CurrentLoyaltyProgressDetails from '@/components/organisms/locking/LoyaltyStatus/CurrentLoyaltyProgressDetails'

const LoyaltyStatus = () => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('locking.widgets.loyalty.title')} />
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <CurrentLoyaltyDescription />
          </Grid>
          <Grid
            item
            xs={4}
            display='flex'
            sx={{
              img: {
                mt: 'auto',
              },
            }}
          >
            <CurrentLoyaltyMascot />
          </Grid>
          <Grid item xs={4} display='flex'>
            <CurrentLoyaltyProgressDetails />
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}
export default LoyaltyStatus
