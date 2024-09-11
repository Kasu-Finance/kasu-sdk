import { Box, Stack } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import RksuBalance from '@/components/molecules/tooltips/RksuBalance'
import RksuTooltip from '@/components/molecules/tooltips/RksuTooltip'
import LoyaltyProgress from '@/components/organisms/lending/OverviewTab/UserLoyalty/LoyaltyProgress'
import ActiveDepositAmount from '@/components/organisms/locking/LoyaltyStatus/ActiveDepositAmount'
import LendingRatio from '@/components/organisms/locking/LoyaltyStatus/LendingRatio'
import RKsuAmount from '@/components/organisms/locking/LoyaltyStatus/RKsuAmount'

import { capitalize } from '@/utils'

const CurrentLoyaltyProgressDetails = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <LoyaltyProgress />
      <Box>
        <InfoRow
          title={`rKSU ${capitalize(t('general.balance'))}`}
          toolTipInfo={<ToolTip title={<RksuBalance />} />}
          showDivider
          metric={<RKsuAmount />}
          sx={{ mt: 'auto' }}
        />

        <InfoRow
          title={t('locking.widgets.loyalty.metric-3')}
          toolTipInfo={<ToolTip title={<RksuTooltip />} />}
          showDivider
          metric={<LendingRatio />}
        />
        <InfoRow
          title={t('locking.widgets.loyalty.metric-2')}
          toolTipInfo={t('locking.widgets.loyalty.metric-2-toolip')}
          showDivider
          metric={<ActiveDepositAmount />}
        />
      </Box>
    </Stack>
  )
}

export default CurrentLoyaltyProgressDetails
