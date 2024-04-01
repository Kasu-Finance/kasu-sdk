import { Button, ButtonProps } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import React, { ReactNode } from 'react'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'

type KycButtonProps = ButtonProps & {
  defaultText?: {
    connectWallet: string
    authenticate: string
    verify: string
  }
}

const KycButton: React.FC<KycButtonProps> = (props) => {
  const { account } = useWeb3React()
  const { openModal } = useModalState()
  const { isVerifying, isAuthenticated, kycCompleted } = useKycState()

  const getButtonState = (): {
    children: ReactNode
    onClick: React.MouseEventHandler<HTMLButtonElement> | undefined
    disabled: boolean
  } => {
    const { defaultText } = props

    if (!account) {
      return {
        children: defaultText?.connectWallet ?? 'Connect Wallet',
        onClick: () => openModal({ name: 'connectWalletModal' }),
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
                name: 'kycModal',
                callback: () => {
                  props.onClick?.(e)
                },
              }),
      disabled: isVerifying,
    }
  }

  const buttonState = getButtonState()

  return <Button {...{ ...props, ...buttonState }} />
}

export default KycButton
