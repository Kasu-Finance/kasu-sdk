import { styled } from '@mui/material/styles'
import Tab from '@mui/material/Tab'

interface StyledTabProps {
  isActive?: boolean
}

const StyledTab = styled(Tab, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<StyledTabProps>(({ theme, isActive }) => ({
  color: isActive ? theme.palette.primary.main : 'white',
  textTransform: 'capitalize',
  fontSize: '14px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5),
    fontSize: 12,
    minWidth: 'unset',
  },
}))

export default StyledTab
