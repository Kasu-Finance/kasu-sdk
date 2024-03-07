import { Tooltip, TooltipProps } from '@mui/material'

import TooltipTrigger from '@/components/atoms/ToolTip/TooltipTrigger'

import { InfoIcon } from '@/assets/icons'

type ToolTipProps = Omit<TooltipProps, 'children'> & {
  children?: React.ReactElement<any, any>
}

const ToolTip: React.FC<ToolTipProps> = ({ children, ...rest }) => (
  <Tooltip disableFocusListener disableTouchListener {...rest}>
    {children ?? (
      <TooltipTrigger>
        <InfoIcon />
      </TooltipTrigger>
    )}
  </Tooltip>
)

export default ToolTip
