import { Box, Divider, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ApyBonus from '@/components/organisms/locking/LoyaltyStatus/ApyBonusBreakdown/ApyBonus'
import CurrentInterestBalance from '@/components/organisms/locking/LoyaltyStatus/ApyBonusBreakdown/CurrentInterestBalance'
import LifetimeInterestBalance from '@/components/organisms/locking/LoyaltyStatus/ApyBonusBreakdown/LifetimeInterestBalance'

const ApyBonusBreakdown = () => {
  const { t } = getTranslation()

  return (
    <Box>
      <Typography variant='h5'>
        {t('locking.widgets.rewardsBreakdown.rewards-1.title')}
      </Typography>
      <Divider sx={{ mt: 1.5 }} />
      <InfoRow
        title={t('locking.widgets.rewardsBreakdown.rewards-1.metric-1')}
        toolTipInfo={t(
          'locking.widgets.rewardsBreakdown.rewards-1.metric-1-tooltip'
        )}
        metric={<ApyBonus />}
        showDivider
      />
      <InfoRow
        title={t('general.balance')}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={t(
          'locking.widgets.rewardsBreakdown.rewards-1.metric-2-tooltip'
        )}
        metric={<CurrentInterestBalance />}
        showDivider
      />
      <InfoRow
        title={t('general.lifetime')}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={t(
          'locking.widgets.rewardsBreakdown.rewards-1.metric-3-tooltip'
        )}
        metric={<LifetimeInterestBalance />}
        showDivider
      />
    </Box>
  )
}

export default ApyBonusBreakdown
