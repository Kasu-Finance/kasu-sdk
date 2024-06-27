import { Box } from '@mui/material'

import NavItem from '@/components/organisms/header/NavItem'

import { NAV_ITEMS } from '@/config/navigation'

interface DesktopNavigationProps {
  account: string | undefined
  isActiveLink: (href: string) => boolean
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  account,
  isActiveLink,
}) => {
  return (
    <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
      {NAV_ITEMS.map((link) =>
        link.accountRequired && !account ? null : (
          <NavItem
            key={link.label}
            isActive={isActiveLink(link.to)}
            href={link.to}
            prefetch
          >
            {link.label}
          </NavItem>
        )
      )}
    </Box>
  )
}

export default DesktopNavigation
