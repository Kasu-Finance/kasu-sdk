import { Box, Stack } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import RksuBalance from '@/components/molecules/tooltips/RksuBalance'
import RksuTooltip from '@/components/molecules/tooltips/RksuTooltip'
import LearnButton from '@/components/organisms/lending/OverviewTab/UserLoyalty/LearnButton'
import LoyaltyProgress from '@/components/organisms/lending/OverviewTab/UserLoyalty/LoyaltyProgress'
import ActiveDepositAmount from '@/components/organisms/locking/LoyaltyStatus/ActiveDepositAmount'
import LendingRatio from '@/components/organisms/locking/LoyaltyStatus/LendingRatio'
import RKsuAmount from '@/components/organisms/locking/LoyaltyStatus/RKsuAmount'

import { capitalize } from '@/utils'

const CurrentLoyaltyProgressDetails = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2} mt='auto' width='100%'>
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
          title={t('locking.widgets.loyalty.metric-2')}
          toolTipInfo={t('locking.widgets.loyalty.metric-2-toolip')}
          showDivider
          metric={<ActiveDepositAmount />}
        />
        <InfoRow
          title={t('locking.widgets.loyalty.metric-3')}
          toolTipInfo={<ToolTip title={<RksuTooltip />} />}
          showDivider
          metric={<LendingRatio />}
        />
      </Box>
      <LearnButton />
    </Stack>
  )
}

export default CurrentLoyaltyProgressDetails
