import { Button, ButtonProps } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ActionStatus } from '@/constants'

const KycButton: React.FC<ButtonProps> = ({ children, ...rest }) => {
  const { account } = useWeb3React()
  const { openModal } = useModalState()
  const { isVerifying, status, kycCompleted } = useKycState()
  const { setToast } = useToastState()

  const handleKyc = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // force toast and prevent further action
    if (status === 'To be reviewed') {
      setToast({
        type: 'warning',
        title: ActionStatus.PROCESSING,
        message:
          'Your identity is being reviewed by our team. Please return to this page later.',
      })

      return
    }

    if (kycCompleted) {
      return rest.onClick?.(e)
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
