import {
  useComPilotConfig,
  useOpenWidget,
  Web3SignatureRejected,
} from '@compilot/react-sdk'
import { Button, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

const KycModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const config = useComPilotConfig()

  const { handleOpenWidget, kycCompleted } = useKycState()

  const { modal } = useModalState()

  const { isPending, openWidget, error } = useOpenWidget()

  const userRejectedSignature = error instanceof Web3SignatureRejected

  const { setToast } = useToastState()

  const { callback } = modal[ModalsKeys.KYC]

  const handleOpen = async () => {
    handleOpenWidget(config, handleClose, callback)
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

  // handle account changes admist kyc modal
  useEffect(() => {
    if (kycCompleted) {
      callback()
      handleClose()
    }
  }, [kycCompleted, handleClose, callback])

  return (
    <CustomCard>
      <DialogHeader title='Identity Verification' onClose={handleClose} />
      <DialogContent>
        <Stack spacing={3}>
          <Typography variant='baseMd' component='p'>
            In order to initiate the KYC process, you must authorise your wallet
            in order to interact with Kasu’s external KYC provider to complete
            the verification process.
            <br />
            <br />
            The verification process will be undertaken by our third party KYC
            provider via an integrated widget.
            <br />
            <br />
            Once completed, please return to this browser window{' '}
            <strong>(do not close this window).</strong>
          </Typography>
          <Button
            fullWidth
            variant='contained'
            color='secondary'
            onClick={handleOpen}
            disabled={isPending}
            sx={{ textTransform: 'capitalize' }}
          >
            Authorise KYC Process
          </Button>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default KycModal
