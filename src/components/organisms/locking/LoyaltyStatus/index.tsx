import { Grid2 } from '@mui/material'

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
      </CustomInnerCardContent>
    </CustomCard>
  )
}
export default LoyaltyStatus
