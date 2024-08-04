'use client'

import { Box, Typography } from '@mui/material'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import ToolTip from '@/components/atoms/ToolTip'
import LoyaltyProgress from '@/components/molecules/locking/LoyaltyOverview/LoyaltyProgress'
import LendingLoyalityLevelsTooltip from '@/components/molecules/tooltips/LendingLoyalityLevelsTooltip'
import RksuBalance from '@/components/molecules/tooltips/RksuBalance'
import RksuTooltip from '@/components/molecules/tooltips/RksuTooltip'

import { capitalize, formatAmount } from '@/utils'

const LendingLoyalityInfo = () => {
  const { t } = useTranslation()

  const { rKsuAmount } = useEarnedRKsu()
  const stakedPercentage = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  const isLoyal = currentLevel === 1 || currentLevel === 2

  return (
    <>
      <Box display='flex' alignItems='center'>
        <Typography variant='subtitle1' component='h6'>
          {t(
            `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.title`
          )}
        </Typography>
        <ToolTip
          title={<LendingLoyalityLevelsTooltip loyalityLevel={currentLevel} />}
        />
      </Box>
      <LoyaltyProgress stakedPercentage={stakedPercentage} />
      <ColoredBox p={{ xs: 1, sm: 0 }}>
        <InfoRow
          showDivider
          title={`rKSU ${capitalize(t('general.balance'))}`}
          toolTipInfo={<ToolTip title={<RksuBalance />} />}
          titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              px: 0,
            },
          })}
          metric={
            <TokenAmount
              amount={formatAmount(rKsuAmount || '0')}
              symbol='rKSU'
            />
          }
        />

        <InfoRow
          title={t('locking.widgets.loyalty.metric-3')}
          toolTipInfo={<ToolTip title={<RksuTooltip />} />}
          titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              px: 0,
            },
          })}
          metric={
            <Typography variant='h6' component='span'>
              {formatAmount(stakedPercentage || '0', {
                maxDecimals: 2,
              })}
              %
            </Typography>
          }
        />
      </ColoredBox>
    </>
  )
}

export default LendingLoyalityInfo
