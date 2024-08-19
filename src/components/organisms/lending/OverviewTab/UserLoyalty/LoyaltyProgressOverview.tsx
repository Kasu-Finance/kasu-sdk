'use client'

import { Stack, Typography } from '@mui/material'

import useStakedKSU from '@/hooks/locking/useStakedKSU'
import useTranslation from '@/hooks/useTranslation'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import RksuBalance from '@/components/molecules/tooltips/RksuBalance'
import RksuTooltip from '@/components/molecules/tooltips/RksuTooltip'
import LoyaltyProgress from '@/components/organisms/lending/OverviewTab/UserLoyalty/LoyaltyProgress'

import { capitalize, formatAmount } from '@/utils'

const LoyaltyProgressOverview = () => {
  const { t } = useTranslation()

  const { rKsuAmount } = useEarnedRKsu()

  const stakedPercentage = useLockingPercentage()

  const { stakedKSU } = useStakedKSU()

  return (
    <Stack height='100%'>
      <LoyaltyProgress />
      <InfoRow
        title={`rKSU ${capitalize(t('general.balance'))}`}
        toolTipInfo={<ToolTip title={<RksuBalance />} />}
        showDivider
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(rKsuAmount || '0', { minDecimals: 2 })} rKSU
          </Typography>
        }
        sx={{ mt: 'auto' }}
      />
      <InfoRow
        title={t('locking.widgets.loyalty.metric-3')}
        toolTipInfo={<ToolTip title={<RksuTooltip />} />}
        showDivider
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(stakedPercentage || '0', {
              minDecimals: 2,
            })}
            %
          </Typography>
        }
      />
      <InfoRow
        title={t('lending.poolOverview.lockingStatus.lockedInfo.label')}
        toolTipInfo={t('lending.poolOverview.lockingStatus.lockedInfo.tooltip')}
        showDivider
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(stakedKSU || '0')} KSU
          </Typography>
        }
      />
    </Stack>
  )
}

export default LoyaltyProgressOverview
