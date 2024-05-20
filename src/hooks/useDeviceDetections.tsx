import { useMediaQuery, useTheme } from '@mui/material'

const useDeviceDetection = () => {
  const theme = useTheme()

  const isDeviceMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isDeviceTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isDeviceLaptop = useMediaQuery(theme.breakpoints.down('lg'))
  const isDeviceDesktop = useMediaQuery(theme.breakpoints.down('xxl'))

  const getCurrentDevice = () => {
    if (isDeviceMobile) {
      return 'mobile'
    } else if (isDeviceTablet) {
      return 'tablet'
    } else if (isDeviceLaptop) {
      return 'laptop'
    } else if (isDeviceDesktop) {
      return 'desktop'
    }
    return 'widescreen'
  }

  const currentDevice = getCurrentDevice()

  return currentDevice
}

export default useDeviceDetection
