import InfoIcon from '@mui/icons-material/Info'
import { Tooltip, TooltipProps } from '@mui/material'
import { SxProps, Theme } from '@mui/system'

export type ToolTipProps = Omit<TooltipProps, 'children'> & {
  children?: React.ReactElement<any, any>
  iconSx?: SxProps<Theme>
}

const ToolTip: React.FC<ToolTipProps> = ({ children, iconSx, ...rest }) => {
  return (
    <Tooltip
      disableFocusListener
      disableTouchListener
      {...rest}
      PopperProps={{ style: { zIndex: 9999999 } }}
    >
      {children ?? (
        <InfoIcon
          sx={[
            (theme) => ({
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
              [theme.breakpoints.down('sm')]: {
                width: 16,
                height: 16,
              },
            }),
            ...(Array.isArray(iconSx) ? iconSx : [iconSx]),
          ]}
        />
      )}
    </Tooltip>
  )
}

export default ToolTip
