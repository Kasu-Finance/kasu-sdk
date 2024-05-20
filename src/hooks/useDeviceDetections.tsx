import { useMediaQuery, useTheme } from '@mui/material'

export enum Device {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  LAPTOP = 'laptop',
  DESKTOP = 'desktop',
  WIDESCREEN = 'widescreen',
}

const useDeviceDetection = () => {
  const theme = useTheme()

  const isDeviceMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isDeviceTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isDeviceLaptop = useMediaQuery(theme.breakpoints.down('lg'))
  const isDeviceDesktop = useMediaQuery(theme.breakpoints.down('xxl'))

  const getCurrentDevice = () => {
    if (isDeviceMobile) {
      return Device.MOBILE
    } else if (isDeviceTablet) {
      return Device.TABLET
    } else if (isDeviceLaptop) {
      return Device.LAPTOP
    } else if (isDeviceDesktop) {
      return Device.DESKTOP
    }
    return Device.WIDESCREEN
  }

  const currentDevice = getCurrentDevice()

  return currentDevice
}

export default useDeviceDetection
