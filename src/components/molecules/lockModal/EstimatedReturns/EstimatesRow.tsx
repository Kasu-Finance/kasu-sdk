import { Box, Tooltip, Typography } from '@mui/material'

import TooltipTrigger from '@/components/atoms/TooltipTrigger'

import { InfoIcon } from '@/assets/icons'

type EstimatesRowProps = {
  title: string
  info: string
  value: string
}

const EstimatesRow: React.FC<EstimatesRowProps> = ({ title, info, value }) => (
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
      <Tooltip disableFocusListener disableTouchListener title={info}>
        <TooltipTrigger>
          <InfoIcon />
        </TooltipTrigger>
      </Tooltip>
    </Box>
    <Typography variant='body2' component='span'>
      {value}
    </Typography>
  </Box>
)

export default EstimatesRow
