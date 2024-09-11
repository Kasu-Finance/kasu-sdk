import { Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CurrentLoyaltyMascot from '@/components/atoms/CurrentLoyaltyMascot'
import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CurrentLoyaltyDescription from '@/components/organisms/locking/LoyaltyStatus/CurrentLoyaltyDescription'
import CurrentLoyaltyProgressDetails from '@/components/organisms/locking/LoyaltyStatus/CurrentLoyaltyProgressDetails'

const LoyaltyStatus = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('locking.widgets.loyalty.title')}
      </Typography>
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <CurrentLoyaltyDescription />
          </Grid>
          <Grid item xs={4}>
            <CurrentLoyaltyMascot />
          </Grid>
          <Grid item xs={4}>
            <CurrentLoyaltyProgressDetails />
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}
export default LoyaltyStatus
