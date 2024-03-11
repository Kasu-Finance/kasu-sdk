import { Button, DialogActions, DialogContent } from '@mui/material'
import { parseUnits } from 'ethers/lib/utils'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalState from '@/hooks/context/useModalState'
import useUnlockKSU from '@/hooks/locking/useUnlockKSU'
import useTranslation from '@/hooks/useTranslation'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import UnlockModalCompleted from '@/components/organisms/modals/UnlockModal/UnlockModalCompleted'
import UnlockModalEdit from '@/components/organisms/modals/UnlockModal/UnlockModalEdit'
import UnlockModalReview from '@/components/organisms/modals/UnlockModal/UnlockModalReview'

import { LockProgress } from '@/context/lockModal/lockModal.types'

import { ChevronRightIcon, EditIcon } from '@/assets/icons'

import sdkConfig from '@/config/sdk'

const UnlockModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { amount, lockState, lockProgress, setLockProgress } =
    useLockModalState()

  const { decimals } = useUserBalance(sdkConfig.contracts.KSUToken)

  const userLock = modal.unlockModal.userLock

  const unlockKSU = useUnlockKSU()

  return (
    <>
      <DialogHeader title='Unlock' onClose={handleClose} />
      <DialogContent>
        {lockProgress === LockProgress.REVIEWING ? (
          <UnlockModalReview
            lockedAmount={userLock.lockedAmount}
            unlockAmount={amount}
          />
        ) : lockProgress === LockProgress.EDITING ? (
          <UnlockModalEdit userLock={userLock} />
        ) : (
          <UnlockModalCompleted userLock={userLock} />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        {lockProgress === LockProgress.REVIEWING ? (
          <>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={() => setLockProgress(LockProgress.EDITING)}
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
        ) : lockProgress === LockProgress.EDITING ? (
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
            onClick={() => setLockProgress(LockProgress.REVIEWING)}
            disabled={lockState.type === 'error'}
          >
            Review Unlock
          </Button>
        ) : (
          <Button variant='contained' sx={{ width: 191 }} onClick={handleClose}>
            LOCKING OVERVIEW
          </Button>
        )}
      </DialogActions>
    </>
  )
}

export default UnlockModal
