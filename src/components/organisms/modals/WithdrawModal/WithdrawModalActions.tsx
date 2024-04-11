import ChevronRight from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import { Button, DialogActions, useTheme } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import {
  ModalStatus,
  ModalStatusAction,
} from '@/context/modalStatus/modalStatus.types'

import { Routes } from '@/config/routes'

interface WithdrawModalActionsProps {
  poolData: PoolOverview
  trancheBalance: string
  onModalClose: () => void
  onSubmitApprove: () => void
}

const WithdrawModalActions: React.FC<WithdrawModalActionsProps> = ({
  poolData,
  trancheBalance,
  onModalClose,
  onSubmitApprove,
}) => {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const { amount } = useWithdrawModalState()
  const { modalStatus, modalStatusAction, setModalStatusAction } =
    useModalStatusState()

  const disabledButton = useMemo(
    () =>
      Boolean(!amount || modalStatus.type === ModalStatus.ERROR) ||
      parseFloat(trancheBalance) === 0,
    [amount, modalStatus.type, trancheBalance]
  )

  const onSubmitRequest = () => {
    setModalStatusAction(ModalStatusAction.APPROVE)
    router.push(`${Routes.lending.root.url}/${poolData.id}?step=2`)
  }

  const handleAdjust = () => {
    setModalStatusAction(ModalStatusAction.REQUEST)
    router.push(`${Routes.lending.root.url}/${poolData.id}?step=1`)
  }

  return (
    <DialogActions
      sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}
    >
      {modalStatusAction === ModalStatusAction.REQUEST && (
        <Button
          variant='contained'
          sx={{ fontSize: '15px' }}
          endIcon={
            <ChevronRight
              sx={{
                color: disabledButton
                  ? 'rgba(0, 0, 0, 0.26)'
                  : theme.palette.common.white,
              }}
            />
          }
          onClick={onSubmitRequest}
          disabled={disabledButton}
        >
          {t('lending.withdraw.button.review')}
        </Button>
      )}

      {modalStatusAction === ModalStatusAction.APPROVE && (
        <>
          <Button
            variant='outlined'
            startIcon={<EditIcon />}
            onClick={handleAdjust}
            sx={{ mr: 1, fontSize: '15px' }}
          >
            {t('lending.withdraw.button.adjust')}
          </Button>
          <Button
            variant='contained'
            endIcon={<ChevronRight />}
            onClick={onSubmitApprove}
            sx={{ fontSize: '15px' }}
          >
            {t('lending.withdraw.button.confirm')}
          </Button>
        </>
      )}

      {modalStatusAction === ModalStatusAction.CONFIRM && (
        <Button
          variant='contained'
          onClick={onModalClose}
          sx={{ fontSize: '15px' }}
        >
          {t('lending.withdraw.button.poolOverview')}
        </Button>
      )}
    </DialogActions>
  )
}

export default WithdrawModalActions
