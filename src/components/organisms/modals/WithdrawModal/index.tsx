'use client'

import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import { useRouter } from 'next/navigation'
import React, { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useToastState from '@/hooks/context/useToastState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import usePoolTrancheBalance from '@/hooks/lending/usePoolTrancheBalance'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useWithdrawRequest from '@/hooks/lending/useWithdrawRequest'
import useTranslation from '@/hooks/useTranslation'
import useHandleError from '@/hooks/web3/useHandleError'

import DialogHeader from '@/components/molecules/DialogHeader'
import HorizontalStepper from '@/components/molecules/HorizontalStepper'
import WithdrawModalActions from '@/components/organisms/modals/WithdrawModal/WithdrawModalActions'
import WithdrawModalApprove from '@/components/organisms/modals/WithdrawModal/WithdrawModalApprove'
import WithdrawModalConfirm from '@/components/organisms/modals/WithdrawModal/WithdrawModalConfirm'
import WithdrawModalMetrics from '@/components/organisms/modals/WithdrawModal/WithdrawModalMetrics'
import WithdrawModalRequest from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { Routes } from '@/config/routes'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'

interface WithdrawModalProps {
  handleClose: () => void
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ handleClose }) => {
  const { amount, selectedTranche } = useWithdrawModalState()
  const router = useRouter()
  const { t } = useTranslation()

  const { modal } = useModalState()
  const { modalStatus, setModalStatusAction, modalStatusAction } =
    useModalStatusState()
  const { setToast, removeToast } = useToastState()
  const handleError = useHandleError()

  const poolData = modal.withdrawModal.poolData

  const { requestWithdrawal, data: withdrawTransaction } = useWithdrawRequest()
  const { data: userPoolBalance } = useUserPoolBalance(poolData?.id)
  const { data: poolTranche } = usePoolTrancheBalance(
    poolData?.id,
    selectedTranche
  )

  const poolBalance = useMemo(() => {
    if (!userPoolBalance) return '0'
    const decimals = 6
    return formatUnits(userPoolBalance?.balance || '0', decimals)
  }, [userPoolBalance])

  const trancheBalance = useMemo(() => {
    if (!poolTranche) return '0'
    const decimals = 6
    return formatUnits(poolTranche?.balance || '0', decimals)
  }, [poolTranche])

  const isMultiTranche = useMemo(
    () => poolData?.tranches?.length > 1,
    [poolData]
  )

  const txHash = withdrawTransaction?.hash

  const validationStyle =
    modalStatus.type === 'error'
      ? 'light-error-background'
      : 'light-blue-background'

  const onModalClose = () => {
    handleClose()
    router.push(Routes.lending.root.url)
  }

  const onSubmitApprove = async () => {
    setToast({
      type: 'info',
      title: ActionStatus.PROCESSING,
      message: ACTION_MESSAGES[ActionStatus.PROCESSING],
      isClosable: false,
    })
    try {
      const txResponse = await requestWithdrawal(
        poolData.id,
        selectedTranche,
        amount
      )
      console.warn('withdrawal txResponse', txResponse)
      setModalStatusAction(ModalStatusAction.CONFIRM)
      router.push(`${Routes.lending.root.url}?poolId=${poolData?.id}&step=3`)
      removeToast()
    } catch (error) {
      handleError(
        error,
        `${ActionType.WITHDRAW} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.WITHDRAW][ActionStatus.ERROR]
      )
    }
  }

  return (
    <>
      <DialogHeader
        title={t('lending.withdraw.title')}
        showClose={!txHash}
        onClose={onModalClose}
      >
        {txHash && (
          <Button
            sx={{ height: 30, width: 97, p: '4px 10px' }}
            variant='outlined'
            startIcon={<ReceiptIcon />}
            href={txHash}
            target='_blank'
          >
            {t('lending.withdraw.button.viewTx')}
          </Button>
        )}
      </DialogHeader>
      <DialogContent>
        <Box mt={3} width='100%'>
          <HorizontalStepper
            activeStep={modalStatusAction as number}
            steps={['Request', 'Approve', 'Confirm']}
          />
        </Box>

        {modalStatusAction !== ModalStatusAction.CONFIRM && (
          <WithdrawModalMetrics
            poolBalance={poolBalance}
            trancheBalance={trancheBalance}
            poolData={poolData}
            selectedTranche={selectedTranche}
            modalStatusAction={modalStatusAction as number}
            isMultiTranche={isMultiTranche}
            metricsRowClassName={validationStyle}
          />
        )}

        {modalStatusAction === ModalStatusAction.REQUEST && (
          <WithdrawModalRequest
            poolData={poolData}
            balance={trancheBalance}
            isMultiTranche={isMultiTranche}
            containerClassName={validationStyle}
          />
        )}

        {modalStatusAction === ModalStatusAction.APPROVE && (
          <WithdrawModalApprove />
        )}

        {modalStatusAction === ModalStatusAction.CONFIRM && (
          <WithdrawModalConfirm amount={amount} poolData={poolData} />
        )}
      </DialogContent>

      <DialogActions>
        <WithdrawModalActions
          poolData={poolData}
          onModalClose={onModalClose}
          onSubmitApprove={onSubmitApprove}
        />
      </DialogActions>
    </>
  )
}

export default WithdrawModal
