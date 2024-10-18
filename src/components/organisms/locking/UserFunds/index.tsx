import { Grid } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import InfoRow from '@/components/atoms/InfoRow'
import KsuBalance from '@/components/organisms/locking/UserFunds/KsuBalance'
import TotalKsuLocked from '@/components/organisms/locking/UserFunds/TotalKsuLocked'
import UsdcBalance from '@/components/organisms/locking/UserFunds/UsdcBalance'
import UserFundsActions from '@/components/organisms/locking/UserFunds/UserFundsActions'

import { getLockPeriods } from '@/app/_requests/lockPeriods'

const UserFunds = async () => {
  const { t } = useTranslation()

  const lockPeriods = await getLockPeriods()

  return (
    <CustomCard>
      <CustomCardHeader title={t('locking.widgets.overview.title')} />
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container columnSpacing={4}>
          <Grid item xs={6}>
            <InfoRow
              title={`${t('general.wallet')}  ${t('general.balance')}`}
              toolTipInfo={t('locking.widgets.overview.metric-1-tooltip')}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={<KsuBalance />}
              showDivider
            />
          </Grid>
          <Grid item xs={6}>
            <InfoRow
              title={t('general.totalKsuLocked')}
              toolTipInfo={t('locking.widgets.overview.metric-3-tooltip')}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={<TotalKsuLocked />}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoRow
              title={t('general.availableFunds')}
              toolTipInfo={t('locking.widgets.overview.metric-2-tooltip')}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={<UsdcBalance />}
              showDivider
            />
          </Grid>
          <UserFundsActions lockPeriods={lockPeriods} />
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default UserFunds
