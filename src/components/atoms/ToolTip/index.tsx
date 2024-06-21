import InfoIcon from '@mui/icons-material/Info'
import { Tooltip, TooltipProps, useTheme } from '@mui/material'
import { SxProps, Theme } from '@mui/system'

export type ToolTipProps = Omit<TooltipProps, 'children'> & {
  children?: React.ReactElement<any, any>
  iconSx?: SxProps<Theme>
}

const ToolTip: React.FC<ToolTipProps> = ({ children, iconSx, ...rest }) => {
  const theme = useTheme()

  return (
    <Tooltip disableFocusListener disableTouchListener {...rest}>
      {children ?? (
        <InfoIcon
          sx={{
            ml: 0.5,
            position: 'relative',
            top: '2px',
            width: '18px',
            height: '18px',
            color: theme.palette.primary.dark,
            cursor: 'help',
            transition: 'color 0.3s ease',
            '&:hover': {
              color: theme.palette.primary.main,
            },
            ...iconSx,
          }}
        />
      )}
    </Tooltip>
  )
}

export default ToolTip
