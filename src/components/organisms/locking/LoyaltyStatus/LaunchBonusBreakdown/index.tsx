import { Box, Button, Divider, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import KsuLaunchBonus from '@/components/molecules/tooltips/KsuLaunchBonus'
import TotalLaunchBonus from '@/components/organisms/locking/LoyaltyStatus/LaunchBonusBreakdown/TotalLaunchBonus'

const LaunchBonusBreakdown = () => {
  const { t } = getTranslation()

  return (
    <Box height='100%' display='flex' flexDirection='column'>
      <Typography variant='h5'>
        {t('locking.widgets.rewardsBreakdown.rewards-2.title')}
      </Typography>
      <Divider sx={{ mt: 1.5 }} />
      <InfoRow
        title={t('general.lifetime')}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={<ToolTip title={<KsuLaunchBonus />} />}
        metric={<TotalLaunchBonus />}
        showDivider
      />
      <Button
        variant='outlined'
        fullWidth
        sx={{ maxWidth: 368, textTransform: 'capitalize', mt: 'auto' }}
        disabled
      >
        {t('general.claim')} KASU
      </Button>
    </Box>
  )
}

export default LaunchBonusBreakdown
