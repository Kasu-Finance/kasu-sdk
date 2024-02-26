import { IconButton, Tooltip } from '@mui/material'

import { InfoIcon } from '@/assets/icons'

interface InfoTooltip {
  title: string
}

const InfoTooltip: React.FC<InfoTooltip> = ({ title }) => {
  return (
    <Tooltip title={title} placement='right'>
      <IconButton
        disableFocusRipple
        disableTouchRipple
        sx={{ background: 'transparent', p: 0, cursor: 'help' }}
      >
        <InfoIcon />
      </IconButton>
    </Tooltip>
  )
}

export default InfoTooltip
