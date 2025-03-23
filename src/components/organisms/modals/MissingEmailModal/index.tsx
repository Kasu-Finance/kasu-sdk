import {
  getIdentityWallets,
  useComPilotConfig,
  useOpenWidget,
  watchIsAuthenticated,
  watchWidgetVisibleState,
  Web3SignatureRejected,
} from '@compilot/react-sdk'
import { Button, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useEffect } from 'react'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

import checkUserKycState from '@/actions/checkUserKycState'
import { ActionStatus } from '@/constants'
import { capitalize } from '@/utils'

const MissingEmailModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const config = useComPilotConfig()

  const { modal } = useModalState()

  const { callback } = modal[ModalsKeys.MISSING_EMAIL]

  const { isPending, openWidget, error } = useOpenWidget()

  const { setCustomerKycInfo } = useKycState()

  const { setToast, removeToast } = useToastState()

  const userRejectedSignature = error instanceof Web3SignatureRejected

  const handleOpen = () => {
    setToast({
      type: 'info',
      title: capitalize(ActionStatus.PROCESSING),
      message: 'Waiting for message signature to be signed...',
      isClosable: false,
    })

    watchIsAuthenticated(config, {
      onIsAuthenticatedChange: (isAuthenticated) => {
        if (isAuthenticated) {
          setToast({
            type: 'info',
            title: 'Email Verification in Progress',
            message: 'Waiting for third party provider...',
            isClosable: false,
          })
        }
      },
    })

    watchWidgetVisibleState(config, {
      onChange: async (isVisible) => {
        // widget close
        if (!isVisible) {
          const account = await getIdentityWallets(config)

          const address = account[0].address

          const kyc = await checkUserKycState(address)

          handleClose()
          removeToast()

          if (!kyc) return

          if (kyc.status === 'No Email') {
            setToast({
              type: 'error',
              title: 'Email update error',
              message:
                'An unexpected error occured while updating your email. Please try again or contact us via the feedback link.',
            })
          }

          callback()
          setCustomerKycInfo(kyc)
        }
      },
    })

    openWidget()
  }

  useEffect(() => {
    if (userRejectedSignature) {
      setToast({
        type: 'error',
        title: 'KYC Authorisation Error',
        message:
          'Message signature request declined. Unable to authorise the KYC process.',
      })
    }
  }, [userRejectedSignature, setToast])

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.missingEmail.title')}
        onClose={handleClose}
      />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        <Stack alignItems='center' spacing={3}>
          <Typography variant='baseMdBold'>
            {t('modals.missingEmail.description-1')}{' '}
            <Typography variant='baseMd'>
              {t('modals.missingEmail.description-2')}
            </Typography>
          </Typography>
          <Button
            variant='contained'
            color='dark'
            fullWidth
            onClick={handleOpen}
            disabled={isPending}
            sx={{ textTransform: 'capitalize' }}
          >
            Authorise Email Process
          </Button>
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default MissingEmailModal
