import { Grid2 } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

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
  const { t } = getTranslation()

  const lockPeriods = await getLockPeriods()

  return (
    <CustomCard>
      <CustomCardHeader title={t('locking.widgets.overview.title')} />
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid2 container columnSpacing={4}>
          <Grid2 size={6}>
            <InfoRow
              title={`KSU ${t('general.balance')}`}
              toolTipInfo={t('locking.widgets.overview.metric-1-tooltip')}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={<KsuBalance />}
              showDivider
            />
          </Grid2>
          <Grid2 size={6}>
            <InfoRow
              title={t('general.totalKsuLocked')}
              toolTipInfo={t('locking.widgets.overview.metric-3-tooltip')}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={<TotalKsuLocked />}
            />
          </Grid2>
          <Grid2 size={6}>
            <InfoRow
              title={t('general.availableFunds')}
              toolTipInfo={t('locking.widgets.overview.metric-2-tooltip')}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={<UsdcBalance />}
              showDivider
            />
          </Grid2>
          <UserFundsActions lockPeriods={lockPeriods} />
        </Grid2>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default UserFunds
