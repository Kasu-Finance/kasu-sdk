import { Box, Typography } from '@mui/material'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'

import ToolTip from '@/components/atoms/ToolTip'

type CurrentLoyaltyRatioProps = {
  stakedPercentage: number
}

const CurrentLoyaltyRatio: React.FC<CurrentLoyaltyRatioProps> = ({
  stakedPercentage,
}) => {
  const { level_2, getCurrentLevel } = useLoyaltyLevel()

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      p={(theme) => theme.spacing('6px', 2)}
    >
      <Box display='flex' alignItems='center'>
        <Typography variant='subtitle2'>Current Loyalty Ratio</Typography>
        <ToolTip title='info' />
      </Box>
      <Typography
        variant='h6'
        component='span'
        color={(theme) =>
          getCurrentLevel(stakedPercentage) === undefined
            ? theme.palette.text.disabled
            : undefined
        }
      >
        {getCurrentLevel(stakedPercentage) === undefined
          ? 'None'
          : `${Math.min(stakedPercentage, level_2)}%`}
      </Typography>
    </Box>
  )
}

export default CurrentLoyaltyRatio
