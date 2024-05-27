import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { Button, ButtonProps } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { ReactNode } from 'react'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

type KycButtonProps = ButtonProps & {
  defaultText?: {
    connectWallet: string
    authenticate: string
    verify: string
  }
}

const KycButton: React.FC<KycButtonProps> = (props) => {
  const { t } = useTranslation()

  const { account } = useWeb3React()
  const { openModal } = useModalState()
  const { isVerifying, isAuthenticated, kycCompleted } = useKycState()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const getButtonState = (): {
    children: ReactNode
    startIcon?: ReactNode
    endIcon?: ReactNode
    onClick: React.MouseEventHandler<HTMLButtonElement> | undefined
    disabled: boolean
  } => {
    const { defaultText } = props

    if (!account) {
      return {
        children: defaultText?.connectWallet ?? t('general.connectWallet'),
        startIcon: <AccountBalanceWalletIcon />,
        endIcon: undefined,
        onClick: () => openModal({ name: ModalsKeys.CONNECT_WALLET }),
        disabled: false,
      }
    }

    return {
      children: props.children,
      onClick:
        isAuthenticated && kycCompleted
          ? props.onClick
          : (e) =>
              openModal({
                name: ModalsKeys.KYC,
                callback: () => {
                  props.onClick?.(e)
                },
              }),
      disabled: isVerifying,
    }
  }

  const buttonState = getButtonState()

  if (isMobile) {
    return null
  }

  return <Button {...{ ...props, ...buttonState }} />
}

export default KycButton
