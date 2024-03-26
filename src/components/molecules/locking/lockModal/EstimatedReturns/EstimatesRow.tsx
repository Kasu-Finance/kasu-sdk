import { Box, Typography } from '@mui/material'

import InfoTooltip from '@/components/atoms/InfoTooltip'

type EstimatesRowProps = {
  title: string
  value: string
  toolTipInfo?: string
}

const EstimatesRow: React.FC<EstimatesRowProps> = ({
  title,
  toolTipInfo,
  value,
}) => (
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
      <InfoTooltip title={toolTipInfo} />
    </Box>
    <Typography variant='body2' component='span'>
      {value}
    </Typography>
  </Box>
)

export default EstimatesRow
