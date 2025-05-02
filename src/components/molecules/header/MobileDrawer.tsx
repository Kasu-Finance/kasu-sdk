import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useAccount } from 'wagmi'

import getTranslation from '@/hooks/useTranslation'

import ConnectWalletButton from '@/components/atoms/ConnectWalletButton'
import DrawerHeader from '@/components/molecules/header/DrawerHeader'
import WalletList from '@/components/molecules/WalletList'

import { NAV_ITEMS } from '@/config/navigation'

interface MobileDrawerProps {
  handleDrawerToggle: () => void
  isActiveLink: (href: string) => boolean
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  handleDrawerToggle,
  isActiveLink,
}) => {
  const { t } = getTranslation()

  const account = useAccount()

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'primary.contrastText',
        color: 'common.white',
      }}
    >
      <DrawerHeader onClose={handleDrawerToggle} />
      <List>
        {NAV_ITEMS.map((link) =>
          link.accountRequired && !account.address ? null : (
            <ListItem
              key={link.label}
              disablePadding
              sx={{ pl: 1 }}
              onClick={handleDrawerToggle}
            >
              <ListItemButton component={Link} href={link.to}>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontSize: 12 }}
                  sx={(theme) => ({
                    pb: 1.5,
                    mt: 0,
                    borderBottom: `1px solid ${theme.palette.primary.main}`,
                    color: isActiveLink(link.to)
                      ? theme.palette.primary.main
                      : 'inherit',
                  })}
                />
              </ListItemButton>
            </ListItem>
          )
        )}
      </List>
      <Box
        mt={3}
        position='relative'
        sx={{
          '&::before': {
            position: 'absolute',
            content: '""',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            boxShadow: 'inset 0px -40px 20px -20px #28282A',
            pointerEvents: 'none',
            zIndex: 10,
          },
        }}
      >
        <Typography variant='h6' color='primary.main' px={3}>
          {t('general.connectWallet')}
        </Typography>
        <WalletList
          sx={{
            maxHeight: 280,
            overflow: 'auto',
            px: 3,
          }}
        />
      </Box>
      {account && (
        <ConnectWalletButton
          size='large'
          sx={{
            width: 'calc(100% - 48px)',
            ml: 3,
            mt: 5,
            '.MuiButton-startIcon': {
              ml: 'auto',
            },
            '.MuiButton-endIcon': {
              ml: 'auto',
            },
          }}
        />
      )}
    </Box>
  )
}

export default MobileDrawer
