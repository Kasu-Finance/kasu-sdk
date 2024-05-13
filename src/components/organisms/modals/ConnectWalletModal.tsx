'use client'

import { Box, Button, CircularProgress, DialogContent } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import Image from 'next/image'
import { isValidElement, useCallback, useEffect, useState } from 'react'

import { useOrderedConnections } from '@/hooks/web3/useOrderedConnections'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'

import { setRecentWeb3Connection } from '@/connection/connection.helper'
import { getConnection } from '@/connection/connectors'
import { userRejectedConnection, web3reactError } from '@/utils'

import { Connection } from '@/types/connectors'

interface LoadingState {
  [key: string]: boolean
}

const ConnectWalletModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const connections = useOrderedConnections()
  const { chainId, account, connector, ENSName } = useWeb3React()
  const connection = getConnection(connector)

  const [loading, setLoading] = useState<LoadingState>({})

  const tryActivation = useCallback(
    async (connection: Connection) => {
      const providerName = connection.getProviderInfo().name

      try {
        setLoading((prev) => ({ ...prev, [providerName]: true }))
        if (connection.overrideActivate?.()) return

        await connection.connector.activate()
      } catch (error) {
        // Ideally set to setError global context.
        web3reactError(error as Error)

        if (userRejectedConnection(connection, error)) {
          console.warn('user rejected')
        }
      } finally {
        setLoading((prev) => ({ ...prev, [providerName]: false }))
        handleClose()
      }
    },
    // eslint-disable-next-line
    [chainId]
  )

  useEffect(() => {
    if (account || ENSName) {
      setRecentWeb3Connection({
        type: connection.type,
        address: account,
        disconnected: false,
        ENSName: ENSName ?? undefined,
        rdns: connection.getProviderInfo().rdns,
      })
    }
  }, [ENSName, account, connection])

  return (
    <>
      <DialogHeader title='Connect wallet' onClose={handleClose} />
      <DialogContent>
        {connections.orderedConnections.map((connection) => {
          const providerInfo = connection.getProviderInfo()

          const isLoading = loading[providerInfo.name]

          const icon = providerInfo.icon

          return (
            <Button
              variant='contained'
              fullWidth
              sx={{ mb: 2, height: 55 }}
              key={providerInfo.name}
              onClick={() => tryActivation(connection)}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : isValidElement(icon) ? (
                <>{icon}</>
              ) : (
                <Box gap={1} display='flex' alignItems='center'>
                  {icon && typeof icon === 'string' && (
                    <Image
                      unoptimized
                      width={30}
                      height={30}
                      src={icon}
                      alt={providerInfo.name}
                    />
                  )}

                  {providerInfo.name}
                </Box>
              )}
            </Button>
          )
        })}
      </DialogContent>
    </>
  )
}

export default ConnectWalletModal
