import { Button, ButtonProps } from '@mui/material'
import React from 'react'
import { useAccount } from 'wagmi'

import useModalState from '@/hooks/context/useModalState'

import { ModalsKeys } from '@/context/modal/modal.types'

const AuthenticateButton: React.FC<ButtonProps> = (props) => {
  const account = useAccount()

  const { openModal } = useModalState()

  const handleOpen = (e: any) => {
    const action = () => props.onClick?.(e)

    if (!account.address) {
      openModal({ name: ModalsKeys.CONNECT_WALLET, callback: action })
      return
    }

    action()
  }

  return <Button {...props} onClick={handleOpen} />
}

export default AuthenticateButton
