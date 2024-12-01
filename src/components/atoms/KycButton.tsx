import { Button, ButtonProps } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ActionStatus } from '@/constants'
import { capitalize } from '@/utils'

const KycButton: React.FC<ButtonProps> = ({ children, ...rest }) => {
  const { account } = useWeb3React()
  const { openModal } = useModalState()
  const { isVerifying, status, lastVerifiedAccount, kycCompleted } =
    useKycState()
  const { setToast } = useToastState()

  const handleKyc = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // force toast and prevent further action
    if (status === 'To be reviewed') {
      setToast({
        type: 'warning',
        title: capitalize(ActionStatus.PROCESSING),
        message:
          'Your identity is being reviewed by our team. Please return to this page later.',
      })

      return
    }
    // force toast and prevent further action
    if (
      status === 'Rejected' ||
      status === 'Failed' ||
      status === 'Terminated'
    ) {
      setToast({
        type: 'error',
        title: capitalize(ActionStatus.REJECTED),
        message:
          'Your identity was rejected. Please contact our team for more information.',
      })

      return
    }

    if (kycCompleted) {
      if (status === 'No Email') {
        openModal({
          name: ModalsKeys.MISSING_EMAIL,
        })

        return
      }

      return rest.onClick?.(e)
    }

    if (!lastVerifiedAccount) {
      setToast({
        type: 'info',
        title: 'Account connected',
        message: 'Verifying status of account...',
        isClosable: false,
      })
    }

    openModal({
      name: ModalsKeys.KYC,
      callback: () => rest.onClick?.(e),
    })
  }

  // prompt connect wallet first
  if (!account) {
    return (
      <AuthenticateButton {...rest} onClick={handleKyc}>
        {children}
      </AuthenticateButton>
    )
  }

  return (
    <Button {...rest} onClick={handleKyc} disabled={isVerifying}>
      {children}
    </Button>
  )
}

export default KycButton
