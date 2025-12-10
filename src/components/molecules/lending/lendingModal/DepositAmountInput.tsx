'use client'

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
import { Box, IconButton, Portal, Typography } from '@mui/material'
import { useWallets } from '@privy-io/react-auth'
import { formatUnits } from 'ethers/lib/utils'
import dynamic from 'next/dynamic'
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useChainId } from 'wagmi'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useDebounce from '@/hooks/useDebounce'
import getTranslation from '@/hooks/useTranslation'
import type useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import NumericalInput from '@/components/molecules/NumericalInput'

import { CloseRoundedIcon } from '@/assets/icons'

import { SupportedTokens } from '@/constants/tokens'
import { customTypography } from '@/themes/typography'
import { toBigNumber } from '@/utils'

const CowSwapWidget = dynamic(
  () => import('@cowprotocol/widget-react').then((mod) => mod.CowSwapWidget),
  {
    ssr: false,
  }
)

type DepositAmountInputProps = {
  selectedToken: SupportedTokens
  amount: string
  amountInUSD: string | undefined
  setAmount: Dispatch<SetStateAction<string>>
  setAmountInUSD: Dispatch<SetStateAction<string | undefined>>
  balance: string
  decimals?: number
  disabled?: boolean
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  applyConversion: (fromAmount: string, token: SupportedTokens) => void
  debounceTime?: number
  setIsValidating: Dispatch<SetStateAction<boolean>>
  validate: (amount: string, amountInUSD?: string) => void
  refetchSupportedTokenUserBalances?: ReturnType<
    typeof useSupportedTokenUserBalances
  >['refetchSupportedTokenUserBalances']
}

const DepositAmountInput: React.FC<DepositAmountInputProps> = ({
  selectedToken,
  amount,
  amountInUSD,
  setAmount,
  setAmountInUSD,
  balance,
  decimals = 18,
  validate,
  disabled,
  startAdornment = <LoginIcon />,
  endAdornment = 'USDC',
  debounceTime = 1000,
  applyConversion,
  refetchSupportedTokenUserBalances,
}) => {
  const { t } = getTranslation()

  const { maxDeposit } = useDepositModalState()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const chainId = useChainId()
  const { wallets } = useWallets()
  const [isSwapWidgetOpen, setIsSwapWidgetOpen] = useState(false)
  const [widgetProvider, setWidgetProvider] = useState<EthereumProvider>()
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const widgetContainerRef = useRef<HTMLDivElement>(null)

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
      const privyProvider = await wallets?.[0]?.getEthereumProvider?.()
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
        asset: 'USDC',
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
      customTokens: [],
    }),
    [chainId, widgetProvider]
  )

  const { debouncedFunction: debouncedValidate } = useDebounce(
    validate,
    debounceTime,
    true
  )

  const { debouncedFunction: debouncedApplyConversion } = useDebounce(
    applyConversion,
    debounceTime,
    true
  )

  const applyMaxAmount = useCallback(
    (currentBalance: string = balance) => {
      if (toBigNumber(currentBalance).isZero()) {
        setAmount('0')
        setAmountInUSD('0')
        return
      }

      const maxPossible = toBigNumber(maxDeposit).lt(
        toBigNumber(currentBalance)
      )
        ? maxDeposit
        : currentBalance

      setAmount(maxPossible)

      if (selectedToken === SupportedTokens.USDC) {
        setAmountInUSD(maxPossible)
        debouncedValidate(maxPossible)

        return
      }

      applyConversion(maxPossible, selectedToken)
    },
    [
      applyConversion,
      balance,
      debouncedValidate,
      maxDeposit,
      selectedToken,
      setAmount,
      setAmountInUSD,
    ]
  )

  const handleAmountChange = useCallback(
    (value: string) => {
      // reset modal state when amount changes
      if (modalStatus.type === 'error') {
        setModalStatus({ type: 'default' })
      }

      setAmount(value)

      // if value is empty skip validation and conversions and reset converted amount
      if (!value) {
        setAmountInUSD(undefined)
        return
      }

      if (selectedToken === SupportedTokens.USDC) {
        setAmountInUSD(value)
        debouncedValidate(value)
        return
      }

      debouncedApplyConversion(value, selectedToken)
    },
    [
      setAmountInUSD,
      selectedToken,
      modalStatus,
      debouncedApplyConversion,
      setAmount,
      setModalStatus,
      debouncedValidate,
    ]
  )

  const handleMax = useCallback(() => {
    applyMaxAmount()
  }, [applyMaxAmount])

  const handleSwapExecuted = useCallback(async () => {
    try {
      if (!refetchSupportedTokenUserBalances) {
        applyMaxAmount()
        return
      }

      const updatedBalances = await refetchSupportedTokenUserBalances()

      const updatedBalanceForToken = updatedBalances?.[selectedToken]

      if (!updatedBalanceForToken) {
        applyMaxAmount()
        return
      }

      const formattedBalance = formatUnits(
        updatedBalanceForToken.balance,
        updatedBalanceForToken.decimals
      )

      applyMaxAmount(formattedBalance)
    } catch (error) {
      console.error(error)
      applyMaxAmount()
    }
  }, [applyMaxAmount, refetchSupportedTokenUserBalances, selectedToken])

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
    <Box>
      <NumericalInput
        amount={amount}
        label={t('modals.lock.swapAndDeposit.input-label')}
        setAmount={handleAmountChange}
        handleMax={handleMax}
        decimals={decimals}
        disabled={disabled}
        rootProps={{
          sx: {
            mt: 1,
            borderRadius: 30,
            bgcolor: 'gold.middle',

            '.MuiInputBase-root': {
              bgcolor: 'inherit',
            },
          },
          onFocus: () => setModalStatus({ type: 'focused' }),
          onBlur: () => {
            validate(amount, amountInUSD)
          },
          error: modalStatus.type === 'error',
          InputLabelProps: {
            shrink: true,
            sx: {
              ...customTypography.baseMd,
              color: 'white',
              ml: 1.3,
            },
          },
          InputProps: {
            startAdornment,
            endAdornment,
            sx: {
              height: 48,
              borderRadius: 'inherit',

              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',

                legend: {
                  ...customTypography.baseMd,
                  fontSize: `calc(${customTypography.baseMd.fontSize}px * 0.75)`,
                  ml: 1.3,
                },
              },
              '& .MuiInputBase-input': {
                px: 1,
              },
            },
          },
        }}
      />
      <Box
        sx={{
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant='body2'
          component='button'
          type='button'
          onClick={() => setIsSwapWidgetOpen(true)}
          sx={{
            color: 'gray.extraDark',
            textDecoration: 'underline',
            cursor: 'pointer',
            bgcolor: 'transparent',
            border: 'none',
            p: 0,
            textAlign: 'left',
            ...customTypography.baseMd,
          }}
        >
          {t('modals.lock.swapAndDeposit.swap-cta')}
        </Typography>
        <Typography
          variant='body2'
          component='span'
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'gray.extraDark',
            ...customTypography.baseMd,
          }}
        >
          or{' '}
          <Box
            component='a'
            href='https://swap.cow.fi/#/1/swap/WETH/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913?theme=dark&targetChainId=8453'
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              color: 'gray.extraDark',
              textDecoration: 'underline',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
              cursor: 'pointer',
            }}
          >
            bridge from another chain
          </Box>
        </Typography>
      </Box>
      {isSwapWidgetOpen && (
        <Portal>
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: (theme) => theme.zIndex.modal + 1,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(0,0,0,0.6)',
              p: 2,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '96vw',
                maxHeight: '90vh',
                p: 2,
                bgcolor: 'transparent',
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
              <Box
                sx={{
                  width: 'fit-content',
                  maxWidth: '96vw',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  borderRadius: 2,
                  boxShadow: 6,
                  bgcolor: 'transparent',
                  position: 'relative',
                  minHeight: params.height ?? '600px',
                }}
                ref={widgetContainerRef}
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
                      px: 2,
                      textAlign: 'center',
                    }}
                  >
                    Loading...
                  </Box>
                )}
                <CowSwapWidget
                  params={params}
                  provider={widgetProvider}
                  listeners={cowEventListeners}
                />
              </Box>
            </Box>
          </Box>
        </Portal>
      )}
      <Typography
        variant='caption'
        component='span'
        sx={{ color: (theme) => theme.palette.error.main }}
        display={modalStatus.type === 'error' ? 'block' : 'none'}
      >
        <br />
        {modalStatus.type === 'error' ? modalStatus.errorMessage : 'message'}
      </Typography>
    </Box>
  )
}

export default DepositAmountInput
