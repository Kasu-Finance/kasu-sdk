import { Button, ButtonProps } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'

import { ModalsKeys } from '@/context/modal/modal.types'

const AuthenticateButton: React.FC<ButtonProps> = (props) => {
  const { account } = useWeb3React()

  const { openModal } = useModalState()

  const handleOpen = (e: any) => {
    const action = () => props.onClick?.(e)

    if (!account) {
      openModal({ name: ModalsKeys.CONNECT_WALLET, callback: action })
      return
    }

    action()
  }

  return <Button {...props} onClick={handleOpen} />
}

export default AuthenticateButton
