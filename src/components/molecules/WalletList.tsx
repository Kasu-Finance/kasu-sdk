import { Box, Button, List, ListItem, ListProps } from '@mui/material'
import Image from 'next/image'
import { isValidElement } from 'react'

import { useOrderedConnections } from '@/hooks/web3/useOrderedConnections'
import useWalletActivation from '@/hooks/web3/useWalletActivation'

type WalletListProps = ListProps

const WalletList: React.FC<WalletListProps> = (listProps) => {
  const connections = useOrderedConnections()

  const { tryActivation } = useWalletActivation()

  return (
    <List
      sx={{
        'li + li': {
          mt: 3,
        },
      }}
      {...listProps}
    >
      {connections.orderedConnections.map((connection) => {
        const providerInfo = connection.getProviderInfo()

        const icon = providerInfo.icon

        return (
          <ListItem key={providerInfo.name} sx={{ p: 0 }}>
            <Button
              variant='contained'
              fullWidth
              color='dark'
              onClick={() => tryActivation(connection)}
            >
              {isValidElement(providerInfo.customIcon) ? (
                providerInfo.customIcon
              ) : (
                <Box gap={1} display='flex' alignItems='center' color='white'>
                  {isValidElement(icon) ? (
                    icon
                  ) : typeof icon === 'string' ? (
                    <Image
                      unoptimized
                      width={30}
                      height={30}
                      src={icon}
                      alt={providerInfo.name}
                    />
                  ) : null}
                  {providerInfo.name}
                </Box>
              )}
            </Button>
          </ListItem>
        )
      })}
    </List>
  )
}

export default WalletList
