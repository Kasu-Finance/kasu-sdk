import InfoIcon from '@mui/icons-material/Info'
import { Tooltip, TooltipProps, useTheme } from '@mui/material'

export type ToolTipProps = Omit<TooltipProps, 'children'> & {
  children?: React.ReactElement<any, any>
}

const ToolTip: React.FC<ToolTipProps> = ({ children, ...rest }) => {
  const theme = useTheme()

  return (
    <Tooltip disableFocusListener disableTouchListener {...rest}>
      {children ?? (
        <InfoIcon
          sx={{
            ml: 0.5,
            width: '18px',
            height: '18px',
            color: theme.palette.primary.dark,
            cursor: 'help',
            transition: 'color 0.3s ease',
            '&:hover': {
              color: theme.palette.primary.main,
            },
          }}
        />
      )}
    </Tooltip>
  )
}

export default ToolTip
