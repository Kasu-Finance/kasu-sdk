import { Box, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'

const LaunchBonus = () => {
  const { t } = useTranslation()

  return (
    <ColoredBox mt={1}>
      <Box p={[1, 2]} mb={1}>
        <Typography variant='subtitle1' component='span' display='block'>
          {t('locking.widgets.totalRewards.rewards-2.title')}
        </Typography>
      </Box>
      <InfoRow
        title={t('locking.widgets.totalRewards.rewards-2.metric')}
        toolTipInfo='info'
        metric={
          <Box>
            <TokenAmount amount='0.00' symbol='KSU' />
          </Box>
        }
      />
    </ColoredBox>
  )
}

export default LaunchBonus
