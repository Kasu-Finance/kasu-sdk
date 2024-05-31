import LockClockIcon from '@mui/icons-material/LockClock'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useCallback } from 'react'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'

import checkUserKycState from '@/actions/checkUserKycState'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { sleep } from '@/utils'

const KycModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { provider } = useWeb3React()

  const {
    authenticate,
    initializeClient,
    isAuthenticated,
    identityClient,
    authenticatedUser,
  } = useKycState()

  const { modal } = useModalState()

  const { setToast, removeToast } = useToastState()

  const handleError = useHandleError()

  const closeScreenCallback = useCallback(
    async (kycCompleted: boolean) => {
      if (!kycCompleted) {
        return handleError(
          new Error(),
          `${ActionType.KYC} ${ActionStatus.ERROR}`,
          ACTION_MESSAGES[ActionType.KYC][ActionStatus.ERROR]
        )
      }

      let timer = 10 // in seconds

      const handleToastClose = (clearInterval?: () => void) => {
        clearInterval?.()
        handleClose()
        modal.kycModal.callback && modal.kycModal.callback()
      }

      const updateTime = (clearInterval?: () => void) => {
        if (timer === 0) {
          removeToast()

          handleToastClose(clearInterval)

          return
        }

        setToast({
          type: 'success',
          title: `${ActionType.KYC} ${ActionStatus.SUCCESS}`,
          message: ACTION_MESSAGES[ActionType.KYC][ActionStatus.SUCCESS](timer),
          onCloseCallback: () => handleToastClose(clearInterval),
        })

        timer--
      }

      updateTime()

      const interval = setInterval(() => {
        updateTime(() => clearInterval(interval))
        return
      }, 1000)
    },
    [handleClose, handleError, modal.kycModal, removeToast, setToast]
  )

  const handleAuth = async () => {
    if (!provider) return console.error('KYC Auth: Provider is not defined')

    const signer = provider.getSigner()

    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionType.KYC_AUTH][ActionStatus.PROCESSING],
        isClosable: false,
      })

      const initData = await authenticate(signer, removeToast)

      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: 'Initializing Nexera SDK...',
        isClosable: false,
      })

      await initializeClient(signer, initData, removeToast, closeScreenCallback)
    } catch (error) {
      handleError(
        error,
        ActionType.KYC_AUTH,
        ACTION_MESSAGES[ActionType.KYC_AUTH][ActionStatus.ERROR]
      )
    }
  }

  const handleVerification = async (verificationStarted: boolean = false) => {
    if (!authenticatedUser)
      return console.error('KYC Verification: No authenticated user')

    try {
      if (!verificationStarted) {
        identityClient.startVerification()
      }

      await sleep(15000)

      const status = await checkUserKycState(authenticatedUser)

      if (status === 'To be reviewed') {
        identityClient.close()

        setToast({
          type: 'warning',
          title: ActionStatus.PROCESSING,
          message: 'Your identity is being reviewed by our team.',
        })

        handleClose()
        return
      }

      handleVerification(true)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <DialogHeader title='Identity Verification' onClose={handleClose} />
      <DialogContent>
        <Typography variant='body1' component='p'>
          {isAuthenticated ? (
            <>
              The verification process will be undertaken via our third party
              KYC provider via integrated widget.
              <br />
              <br />
              Once completed, please return to this browser window{' '}
              <strong>(do not close this window).</strong>
            </>
          ) : (
            'In order to initiate the KYC process, you must authorise your wallet in order to interact with Kasu’s external KYC provider to complete the verification process.​'
          )}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: 'center', textTransform: 'uppercase', pb: 2 }}
      >
        {isAuthenticated ? (
          <Button
            variant='contained'
            startIcon={<UploadFileIcon />}
            onClick={() => handleVerification()}
            disabled={!identityClient.polygonIdDID}
          >
            Submit Kyc Documents
          </Button>
        ) : (
          <Button
            variant='contained'
            startIcon={<LockClockIcon />}
            onClick={handleAuth}
          >
            Authorise KYC Process
          </Button>
        )}
      </DialogActions>
    </>
  )
}

export default KycModal
