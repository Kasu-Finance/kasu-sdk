import { Box, Tooltip, Typography } from '@mui/material'

import { InfoIcon } from '@/assets/icons'

type RewardRowProps = {
  title: string
  info: string
  amount: string
}

const RewardRow: React.FC<RewardRowProps> = ({ title, info, amount }) => {
  return (
    <Box display='flex' justifyContent='space-between' px={2} py='6px'>
      <Box display='flex' alignItems='center'>
        <Typography
          variant='subtitle2'
          component='span'
          color='text.primary'
          mr='4px'
        >
          {title}
        </Typography>
        <Tooltip
          disableFocusListener
          disableTouchListener
          title={info}
          placement='top'
        >
          <Box display='flex' alignItems='center'>
            <InfoIcon />
          </Box>
        </Tooltip>
      </Box>
      <Typography variant='body2' component='span'>
        {amount} USDC
      </Typography>
    </Box>
  )
}

export default RewardRow
