import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { parseUnits } from 'ethers/lib/utils'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useUnlockKSU from '@/hooks/locking/useUnlockKSU'
import useTranslation from '@/hooks/useTranslation'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import UnlockModalCompleted from '@/components/organisms/modals/UnlockModal/UnlockModalCompleted'
import UnlockModalEdit from '@/components/organisms/modals/UnlockModal/UnlockModalEdit'
import UnlockModalReview from '@/components/organisms/modals/UnlockModal/UnlockModalReview'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import sdkConfig from '@/config/sdk'
import { capitalize } from '@/utils'

const UnlockModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { amount } = useLockModalState()

  const { modalStatus, modalStatusAction, setModalStatusAction } =
    useModalStatusState()

  const { decimals } = useUserBalance(sdkConfig.contracts.KSUToken)

  const userLock = modal.unlockModal.userLock

  const unlockKSU = useUnlockKSU()

  return (
    <>
      <DialogHeader
        title={capitalize(t('general.unlock'))}
        onClose={handleClose}
      />
      <DialogContent>
        {modalStatusAction === ModalStatusAction.REVIEWING ? (
          <UnlockModalReview
            lockedAmount={userLock.lockedAmount}
            unlockAmount={amount}
          />
        ) : modalStatusAction === ModalStatusAction.EDITING ? (
          <UnlockModalEdit userLock={userLock} />
        ) : (
          <UnlockModalCompleted userLock={userLock} />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        {modalStatusAction === ModalStatusAction.REVIEWING ? (
          <>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={() => setModalStatusAction(ModalStatusAction.EDITING)}
            >
              {t('general.adjust')}
            </Button>
            <Button
              variant='contained'
              endIcon={<ChevronRightIcon />}
              onClick={() =>
                unlockKSU(parseUnits(amount, decimals), userLock.id)
              }
            >
              {t('general.confirm')}
            </Button>
          </>
        ) : modalStatusAction === ModalStatusAction.EDITING ? (
          <Button
            sx={{
              width: 191,
              textTransform: 'uppercase',
              mx: 'auto',
              '& .MuiButton-endIcon': {
                ml: 1.5,
              },
              '&:disabled .MuiButton-endIcon svg path': {
                fill: 'rgba(0, 0, 0, 0.26)',
              },
            }}
            variant='contained'
            endIcon={<ChevronRightIcon />}
            onClick={() => setModalStatusAction(ModalStatusAction.REVIEWING)}
            disabled={modalStatus.type === 'error'}
          >
            {t('modals.unlock.buttons.reviewUnlock')}
          </Button>
        ) : (
          <Button variant='contained' sx={{ width: 191 }} onClick={handleClose}>
            {t('modals.lock.completed.lockingOverview')}
          </Button>
        )}
      </DialogActions>
    </>
  )
}

export default UnlockModal
