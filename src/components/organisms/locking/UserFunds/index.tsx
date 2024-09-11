import { Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import InfoRow from '@/components/atoms/InfoRow'
import KsuBalance from '@/components/organisms/locking/UserFunds/KsuBalance'
import TotalKsuLocked from '@/components/organisms/locking/UserFunds/TotalKsuLocked'
import UsdcBalance from '@/components/organisms/locking/UserFunds/UsdcBalance'
import UserFundsActions from '@/components/organisms/locking/UserFunds/UserFundsActions'

const UserFunds = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('locking.widgets.overview.title')}
      </Typography>
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <InfoRow
              title={`${t('general.wallet')}  ${t('general.balance')}`}
              toolTipInfo={t('locking.widgets.overview.metric-1-tooltip')}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={<KsuBalance />}
              showDivider
            />
          </Grid>
          <Grid item xs={4}>
            <InfoRow
              title={t('general.totalKsuLocked')}
              toolTipInfo={t('locking.widgets.overview.metric-3-tooltip')}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={<TotalKsuLocked />}
              showDivider
            />
          </Grid>
          <Grid item xs={4}>
            <InfoRow
              title={t('general.availableFunds')}
              toolTipInfo={t('locking.widgets.overview.metric-2-tooltip')}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={<UsdcBalance />}
              showDivider
            />
          </Grid>
          <UserFundsActions />
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default UserFunds
