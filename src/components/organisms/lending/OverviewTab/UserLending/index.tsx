import { Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import UserLendingSummary from '@/components/organisms/lending/OverviewTab/UserLending/UserLendingSummary'
import UserLendingTrancheDetail from '@/components/organisms/lending/OverviewTab/UserLending/UserLendingTrancheDetail'
import WithdrawButton from '@/components/organisms/lending/OverviewTab/UserLending/WithdrawButton'

import { PoolOverviewWithDelegate } from '@/types/page'

type UserLendingProps = {
  pool: PoolOverviewWithDelegate
}

const UserLending: React.FC<UserLendingProps> = ({ pool }) => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('lending.poolOverview.investmentCard.title')}
      </Typography>
      <CustomInnerCardContent>
        <UserLendingSummary pool={pool} />
        {pool.tranches.length > 1 && <UserLendingTrancheDetail pool={pool} />}
        <WithdrawButton pool={pool} />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default UserLending
