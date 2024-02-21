import { Box, Typography } from '@mui/material'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'

type CurrentLoyaltyRatioProps = {
  stakedPercentage: number
}

const CurrentLoyaltyRatio: React.FC<CurrentLoyaltyRatioProps> = ({
  stakedPercentage,
}) => {
  const { level_2, currentLevel } = useLoyaltyLevel(stakedPercentage)

  const { t } = useTranslation()

  const isLoyal = currentLevel === 1 || currentLevel === 2

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      p={(theme) => theme.spacing('6px', 2)}
    >
      <Box display='flex' alignItems='center'>
        <Typography variant='subtitle2'>
          {t('locking.widgets.loyalty.metric-1')}
        </Typography>
        <ToolTip title='info' />
      </Box>
      <Typography
        variant='h6'
        component='span'
        color={(theme) => (!isLoyal ? theme.palette.text.disabled : undefined)}
      >
        {!isLoyal
          ? t('general.none')
          : `${Math.min(stakedPercentage, level_2)}%`}
      </Typography>
    </Box>
  )
}

export default CurrentLoyaltyRatio
