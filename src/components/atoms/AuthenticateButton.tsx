import { Button, ButtonProps } from '@mui/material'
import { useLogin } from '@privy-io/react-auth'
import React, { useState } from 'react'

import useKycState from '@/hooks/context/useKycState'
import useToastState from '@/hooks/context/useToastState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

type AuthenticateButtonProps = ButtonProps & {
  onAuthenticated: () => void
}

const AuthenticateButton: React.FC<AuthenticateButtonProps> = ({
  onAuthenticated,
  ...rest
}) => {
  const { isAuthenticated } = usePrivyAuthenticated()

  // adding this because useLogin `onComplete` callback is global and will be triggered when ConnetWalletButton is pressed
  const [buttonClicked, setButtonClicked] = useState(false)

  const { checkUserKyc } = useKycState()

  const { setToast } = useToastState()

  const { login } = useLogin({
    onComplete: async ({ user }) => {
      setToast({
        type: 'info',
        title: 'Account connected',
        message: 'Verifying status of account...',
        isClosable: false,
      })

      if (user.wallet?.address) {
        await checkUserKyc(user.wallet.address)
      }

      if (buttonClicked) {
        onAuthenticated()
        setButtonClicked(false)
      }
    },
  })

  const handleOpen = (e: any) => {
    if (!isAuthenticated) {
      setButtonClicked(true)
      login()
      return
    }

    onAuthenticated?.()

    rest.onClick?.(e)
  }

  return <Button {...rest} onClick={handleOpen} />
}

export default AuthenticateButton
