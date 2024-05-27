import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Theme,
} from '@mui/material'
import Link from 'next/link'

import DrawerHeader from '@/components/molecules/header/DrawerHeader'

import { NAV_ITEMS } from '@/config/navigation'

interface MobileDrawerProps {
  account: string | undefined
  theme: Theme
  handleDrawerToggle: () => void
  isActiveLink: (href: string) => boolean
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  account,
  theme,
  handleDrawerToggle,
  isActiveLink,
}) => (
  <Box
    sx={{
      width: '100vw',
      height: '100vh',
      bgcolor: theme.palette.primary.contrastText,
      color: theme.palette.common.white,
    }}
    onClick={handleDrawerToggle}
  >
    <DrawerHeader onClose={handleDrawerToggle} theme={theme} />
    <List>
      {NAV_ITEMS.map((link) =>
        link.accountRequired && !account ? null : (
          <ListItem key={link.label} disablePadding sx={{ pl: 1 }}>
            <ListItemButton component={Link} href={link.to}>
              <ListItemText
                primary={link.label}
                primaryTypographyProps={{ fontSize: 12 }}
                sx={{
                  pb: 1.5,
                  mt: 0,
                  borderBottom: `1px solid ${theme.palette.primary.main}`,
                  color: isActiveLink(link.to)
                    ? theme.palette.primary.main
                    : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        )
      )}
    </List>
  </Box>
)

export default MobileDrawer
