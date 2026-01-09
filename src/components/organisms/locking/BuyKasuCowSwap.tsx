import {
  type CowWidgetEventListeners,
  CowWidgetEvents,
} from '@cowprotocol/events'
import type {
  CowSwapWidgetParams,
  EthereumProvider,
  TradeType,
} from '@cowprotocol/widget-lib'
import LoginIcon from '@mui/icons-material/Login'
import type { ButtonProps } from '@mui/material'
import { Box, Button, IconButton, Portal, Typography } from '@mui/material'
import { useWallets } from '@privy-io/react-auth'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChainId } from 'wagmi'

import useUserBalance from '@/hooks/web3/useUserBalance'

import { CloseRoundedIcon } from '@/assets/icons'

import sdkConfig from '@/config/sdk'
import { customTypography } from '@/themes/typography'
import { wrapQueuedProvider } from '@/utils/rpc/rpcQueue'

const CowSwapWidget = dynamic(
  () => import('@cowprotocol/widget-react').then((mod) => mod.CowSwapWidget),
  {
    ssr: false,
  }
)

type BuyKasuCowSwapProps = {
  buttonProps?: ButtonProps
}

const BuyKasuCowSwap: React.FC<BuyKasuCowSwapProps> = ({ buttonProps }) => {
  const chainId = useChainId()
  const { wallets } = useWallets()
  const [isSwapWidgetOpen, setIsSwapWidgetOpen] = useState(false)
  const [widgetProvider, setWidgetProvider] = useState<EthereumProvider>()
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const widgetContainerRef = useRef<HTMLDivElement>(null)

  const { refetchUserBalance } = useUserBalance(sdkConfig.contracts.KSUToken)

  const normalizeCowProvider = useCallback(
    (provider: any): EthereumProvider | undefined => {
      if (!provider) return undefined

      const request =
        typeof provider.request === 'function'
          ? provider.request.bind(provider)
          : typeof provider.send === 'function'
            ? ({ method, params }: { method: string; params?: unknown[] }) =>
                provider.send(method, params)
            : undefined

      const on =
        typeof provider.on === 'function'
          ? provider.on.bind(provider)
          : typeof provider.addListener === 'function'
            ? provider.addListener.bind(provider)
            : undefined

      if (!request || !on) return undefined

      const enable =
        typeof provider.enable === 'function'
          ? provider.enable.bind(provider)
          : () =>
              request({
                method: 'eth_requestAccounts',
                params: [],
              } as any)

      return {
        request,
        on,
        enable,
      }
    },
    []
  )

  useEffect(() => {
    let isMounted = true

    const resolveProvider = async () => {
      const privyProvider = wrapQueuedProvider(
        await wallets?.[0]?.getEthereumProvider?.()
      )
      const normalizedPrivy = normalizeCowProvider(privyProvider)
      const normalizedWindow = normalizeCowProvider(
        typeof window !== 'undefined' ? (window as any).ethereum : undefined
      )

      if (isMounted) {
        setWidgetProvider(normalizedPrivy ?? normalizedWindow)
      }
    }

    resolveProvider()

    return () => {
      isMounted = false
    }
  }, [wallets, normalizeCowProvider])

  useEffect(() => {
    if (!isSwapWidgetOpen) return

    setWidgetLoaded(false)

    let iframe: HTMLIFrameElement | null = null
    const handleLoad = () => setWidgetLoaded(true)

    const poll = window.setInterval(() => {
      if (iframe) {
        return
      }

      const candidate = widgetContainerRef.current?.querySelector('iframe')
      if (candidate) {
        iframe = candidate
        iframe.addEventListener('load', handleLoad)

        if (iframe.contentDocument?.readyState === 'complete') {
          setWidgetLoaded(true)
        }

        window.clearInterval(poll)
      }
    }, 100)

    return () => {
      window.clearInterval(poll)
      if (iframe) {
        iframe.removeEventListener('load', handleLoad)
      }
    }
  }, [isSwapWidgetOpen])

  const params: CowSwapWidgetParams = useMemo(
    () => ({
      appCode: 'Kasu',
      chainId: chainId,
      tokenLists: [
        'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/CoinGecko.1.json',
        'https://files.cow.fi/tokens/CowSwap.json',
      ],
      tradeType: 'swap' as TradeType,
      sell: {
        asset: 'ETH',
      },
      buy: {
        asset: sdkConfig.contracts.KSUToken,
      },
      enabledTradeTypes: ['swap'] as TradeType[],
      theme: {
        baseTheme: 'dark',
        primary: '#e2b47f',
        background: '#f7f7f7',
        paper: '#e7c093',
        text: '#000000',
        warning: '#000000',
        danger: '#000000',
        alert: '#b8ffb2',
        success: '#ffffff',
        info: '#000000',
      },
      hideNetworkSelector: true,
      standaloneMode: !widgetProvider,
      disableToastMessages: false,
      disableProgressBar: false,
      hideLogo: true,
      hideBridgeInfo: true,
      hideOrdersTable: true,
      images: {},
      sounds: {},
      customTokens: [
        {
          chainId: chainId,
          address: sdkConfig.contracts.KSUToken,
          name: 'KASU',
          decimals: 18,
          symbol: 'KASU',
        },
      ],
    }),
    [chainId, widgetProvider]
  )

  const handleSwapExecuted = useCallback(async () => {
    try {
      await refetchUserBalance?.()
      setIsSwapWidgetOpen(false)
    } catch (error) {
      console.error(error)
    }
  }, [refetchUserBalance])

  const cowEventListeners = useMemo<CowWidgetEventListeners>(
    () => [
      {
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: () => {
          void handleSwapExecuted()
        },
      },
    ],
    [handleSwapExecuted]
  )

  return (
    <>
      <Button
        variant='outlined'
        startIcon={<LoginIcon />}
        onClick={() => setIsSwapWidgetOpen(true)}
        {...buttonProps}
      />
      {isSwapWidgetOpen && (
        <Portal>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1300,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: '16px',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '96vw',
                maxHeight: '90vh',
                padding: '16px',
                backgroundColor: 'transparent',
              }}
            >
              <IconButton
                onClick={() => setIsSwapWidgetOpen(false)}
                sx={{
                  position: 'absolute',
                  top: -15,
                  right: -10,
                  p: 0.5,
                  borderRadius: '50%',
                  zIndex: 10,
                  boxShadow: 6,
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
              <div
                ref={widgetContainerRef}
                style={{
                  width: 'fit-content',
                  maxWidth: '96vw',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  borderRadius: 8,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                  backgroundColor: 'transparent',
                  position: 'relative',
                  minHeight: params.height ?? '600px',
                }}
              >
                {!widgetLoaded && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      zIndex: 5,
                      px: 1,
                      textAlign: 'center',
                      ...customTypography.baseMd,
                    }}
                  >
                    <Typography variant='inherit'>Loading...</Typography>
                  </Box>
                )}
                <CowSwapWidget
                  params={params}
                  provider={widgetProvider}
                  listeners={cowEventListeners}
                />
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

export default BuyKasuCowSwap
