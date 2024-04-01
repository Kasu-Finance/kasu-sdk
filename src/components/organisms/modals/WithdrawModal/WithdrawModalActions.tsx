import ChevronRight from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Button, DialogActions, useTheme } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { useRouter } from 'next/navigation'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { Routes } from '@/config/routes'

interface WithdrawModalActionsProps {
  poolData: PoolOverview
  disabledButton: boolean
  onModalClose: () => void
}

const WithdrawModalActions: React.FC<WithdrawModalActionsProps> = ({
  poolData,
  disabledButton,
  onModalClose,
}) => {
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const { setProcessing } = useWithdrawModalState()
  const { modalStatusAction, setModalStatusAction } = useModalStatusState()

  const onSubmitRequest = () => {
    setModalStatusAction(ModalStatusAction.APPROVE)
    router.push(`${Routes.lending.root.url}?poolId=${poolData?.id}&step=2`)
  }

  const onSubmitApprove = () => {
    setProcessing(true)

    setTimeout(() => {
      setProcessing(false)
      setModalStatusAction(ModalStatusAction.CONFIRM)
      router.push(`${Routes.lending.root.url}?poolId=${poolData?.id}&step=3`)
    }, 2000)
  }

  const handleAdjust = () => {
    setModalStatusAction(ModalStatusAction.REQUEST)
    router.push(`${Routes.lending.root.url}?poolId=${poolData?.id}&step=1`)
  }

  return (
    <DialogActions>
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
        <Box display='flex' justifyContent='center' width='100%'>
          <Button
            variant='outlined'
            startIcon={<EditIcon />}
            onClick={handleAdjust}
            sx={{ mr: 2, fontSize: '15px' }}
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
        </Box>
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
