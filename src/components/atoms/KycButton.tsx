import { ButtonProps } from '@mui/material'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

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
  const { isVerifying, kycInfo, kycCompleted, checkUserKyc } = useKycState()
  const { setToast } = useToastState()
  const { address } = usePrivyAuthenticated()

  const handleKyc = () => {
    // force toast and prevent further action
    if (
      kycInfo?.status === 'To be reviewed' ||
      kycInfo?.status === 'Escalated'
    ) {
      setToast({
        type: 'warning',
        title: capitalize(ActionStatus.PROCESSING),
        message:
          'Your identity is being reviewed by our team. Please return to this page later.',
        action: address
          ? {
              label: 'Refresh status',
              onClick: () => checkUserKyc(address),
            }
          : undefined,
      })

      return
    }

    if (
      kycInfo?.status === 'Rejected' ||
      kycInfo?.status === 'Failed' ||
      kycInfo?.status === 'Terminated'
    ) {
      const reason =
        typeof kycInfo.reason === 'string' && kycInfo.reason.trim().length
          ? ` Reason: ${kycInfo.reason}`
          : ''

      setToast({
        type: 'error',
        title: capitalize(ActionStatus.REJECTED),
        message: `Your identity verification was not approved.${reason}`,
        action: kycInfo.canRetry
          ? {
              label: 'Retry verification',
              onClick: () =>
                openModal({
                  name: ModalsKeys.KYC,
                  callback: onKycCompleted,
                }),
            }
          : undefined,
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
