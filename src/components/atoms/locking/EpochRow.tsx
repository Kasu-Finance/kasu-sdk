import { Box, Tooltip, Typography } from '@mui/material'

import TooltipTrigger from '@/components/atoms/TooltipTrigger'

import { InfoIcon } from '@/assets/icons'

type EpochRowProps = {
  title: string
  subtitle?: string
  info: string
  amount: string
}

const EpochRow: React.FC<EpochRowProps> = ({
  title,
  subtitle,
  info,
  amount,
}) => {
  return (
    <Box display='flex' justifyContent='space-between' px={2} py='6px'>
      <Box display='flex' alignItems='center'>
        <Box>
          <Typography
            variant='subtitle2'
            component='span'
            color='text.primary'
            mr='4px'
          >
            {title}
          </Typography>
          <Typography
            variant='body2'
            component='span'
            color='text.primary'
            mr='4px'
          >
            {subtitle}
          </Typography>
        </Box>
        <Tooltip disableFocusListener disableTouchListener title={info}>
          <TooltipTrigger>
            <InfoIcon />
          </TooltipTrigger>
        </Tooltip>
      </Box>
      <Typography variant='body2' component='span'>
        {amount} KASU
      </Typography>
    </Box>
  )
}

export default EpochRow
