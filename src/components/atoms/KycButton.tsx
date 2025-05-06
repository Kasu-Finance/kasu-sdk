import { ButtonProps } from '@mui/material'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ActionStatus } from '@/constants'
import { capitalize } from '@/utils'

type KycButtonProps = ButtonProps & {
  onKycCompleted: () => void
}

const KycButton: React.FC<KycButtonProps> = ({
  children,
  onKycCompleted,
  ...rest
}) => {
  const { openModal } = useModalState()
  const { isVerifying, kycInfo, kycCompleted } = useKycState()
  const { setToast } = useToastState()

  const handleKyc = () => {
    // force toast and prevent further action
    if (kycInfo?.status === 'To be reviewed') {
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
      kycInfo?.status === 'Rejected' ||
      kycInfo?.status === 'Failed' ||
      kycInfo?.status === 'Terminated'
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
      if (kycInfo?.status === 'No Email') {
        openModal({
          name: ModalsKeys.MISSING_EMAIL,
          callback: onKycCompleted,
        })

        return
      }

      return onKycCompleted()
    }

    openModal({
      name: ModalsKeys.KYC,
      callback: onKycCompleted,
    })
  }

  return (
    <AuthenticateButton
      {...rest}
      onAuthenticated={handleKyc}
      disabled={isVerifying || rest.disabled}
    >
      {children}
    </AuthenticateButton>
  )
}

export default KycButton
