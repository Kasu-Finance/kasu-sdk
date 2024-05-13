import InfoIcon from '@mui/icons-material/Info'
import { Tooltip, TooltipProps, useTheme } from '@mui/material'

import TooltipTrigger from '@/components/atoms/ToolTip/TooltipTrigger'
type ToolTipProps = Omit<TooltipProps, 'children'> & {
  children?: React.ReactElement<any, any>
}

const ToolTip: React.FC<ToolTipProps> = ({ children, ...rest }) => {
  const theme = useTheme()

  return (
    <Tooltip disableFocusListener disableTouchListener {...rest}>
      {children ?? (
        <TooltipTrigger>
          <InfoIcon
            sx={{
              width: '18px',
              height: '18px',
              color: theme.palette.primary.dark,
            }}
          />
        </TooltipTrigger>
      )}
    </Tooltip>
  )
}

export default ToolTip
