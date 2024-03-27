import VerifiedIcon from '@mui/icons-material/VerifiedSharp'
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Divider,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import DepositModalEdit from '@/components/organisms/modals/DepositModal/DepositModalEdit'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { ChevronRightIcon } from '@/assets/icons'

const STEPS = ['Deposit', 'Approval', 'Confirmation']

const getActiveStep = (modalStatusAction: ModalStatusAction) => {
  switch (modalStatusAction) {
    case ModalStatusAction.EDITING:
      return 0
    case ModalStatusAction.REVIEWING:
      return 1
    case ModalStatusAction.COMPLETED:
      return 2
  }
}

const DepositModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()

  const { modalStatus, modalStatusAction } = useModalStatusState()

  return (
    <>
      <DialogHeader title='Deposit Funds' onClose={handleClose} />
      <DialogContent>
        <Box
          sx={{
            backgroundColor: modalStatus.bgColor,
            transition: 'background-color 0.3s ease',
            p: 1,
          }}
        >
          <Stepper
            activeStep={getActiveStep(modalStatusAction)}
            alternativeLabel
            connector={null}
            sx={{
              display: 'grid',
              gridTemplateColumns:
                'max-content minmax(0,1fr) max-content minmax(0,1fr) max-content',
            }}
          >
            {STEPS.map((label, index) => (
              <Step sx={{ display: 'contents' }} key={label}>
                {index !== 0 && (
                  <Divider
                    sx={{ mt: 1.5, borderColor: 'rgba(189, 189, 189, 1)' }}
                  />
                )}
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <DepositModalEdit poolData={modal.depositModal.poolData} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <>
          <Button variant='outlined' startIcon={<VerifiedIcon />}>
            INCREASE/ESTABLISH LOYALTY LEVEL
          </Button>
          <Button variant='contained' endIcon={<ChevronRightIcon />}>
            REVIEW DEPOSIT
          </Button>
        </>
      </DialogActions>
    </>
  )
}

export default DepositModal
