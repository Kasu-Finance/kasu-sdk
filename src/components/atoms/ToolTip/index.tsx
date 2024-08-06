import InfoIcon from '@mui/icons-material/Info'
import { Tooltip, TooltipProps } from '@mui/material'
import { SxProps, Theme } from '@mui/system'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

export type ToolTipProps = Omit<TooltipProps, 'children'> & {
  children?: React.ReactElement<any, any>
  iconSx?: SxProps<Theme>
}

const ToolTip: React.FC<ToolTipProps> = ({ children, iconSx, ...rest }) => {
  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE
  const isTablet = currentDevice === Device.TABLET

  return (
    <Tooltip
      disableFocusListener
      {...rest}
      arrow={false}
      placement={isMobile || isTablet ? 'bottom' : undefined}
      enterTouchDelay={100}
      PopperProps={{
        style: { zIndex: 9999999 },
      }}
    >
      {children ?? (
        <InfoIcon
          sx={[
            (theme) => ({
              ml: 0.5,
              position: 'relative',
              width: '18px',
              height: '18px',
              color: 'grey.200',
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
