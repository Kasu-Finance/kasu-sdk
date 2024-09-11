import { Box, Divider, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import KsuLaunchBonus from '@/components/molecules/tooltips/KsuLaunchBonus'
import TotalLaunchBonus from '@/components/organisms/locking/RewardsBreakdown/LaunchBonusBreakdown/TotalLaunchBonus'

const LaunchBonusBreakdown = () => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant='h5'>
        {t('locking.widgets.rewardsBreakdown.rewards-2.title')}
      </Typography>
      <Divider sx={{ mt: 1.5 }} />
      <InfoRow
        title={t('locking.widgets.rewardsBreakdown.rewards-2.metric')}
        toolTipInfo={<ToolTip title={<KsuLaunchBonus />} />}
        metric={<TotalLaunchBonus />}
        showDivider
      />
    </Box>
  )
}

export default LaunchBonusBreakdown
