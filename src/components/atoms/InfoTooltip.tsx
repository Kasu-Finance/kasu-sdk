import InfoIcon from '@mui/icons-material/Info'
import { IconButton, Tooltip } from '@mui/material'

interface InfoTooltipProps {
  title: string | null | undefined
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, ...rest }) => {
  if (!title) return null

  return (
    <Tooltip title={title} placement='right' {...rest}>
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
