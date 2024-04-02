'use client'

import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/navigation'
import React, { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useTranslation from '@/hooks/useTranslation'

import DialogHeader from '@/components/molecules/DialogHeader'
import HorizontalStepper from '@/components/molecules/HorizontalStepper'
import ProcessingModal from '@/components/organisms/modals/ProcessingModal'
import WithdrawModalActions from '@/components/organisms/modals/WithdrawModal/WithdrawModalActions'
import WithdrawModalApprove from '@/components/organisms/modals/WithdrawModal/WithdrawModalApprove'
import WithdrawModalConfirm from '@/components/organisms/modals/WithdrawModal/WithdrawModalConfirm'
import WithdrawModalMetrics from '@/components/organisms/modals/WithdrawModal/WithdrawModalMetrics'
import WithdrawModalRequest from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { metricsMock } from '@/app/mock-data/withdrawMock'
import { Routes } from '@/config/routes'
import { formatAccount } from '@/utils'

interface WithdrawModalProps {
  handleClose: () => void
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ handleClose }) => {
  const {
    amount,
    selectedTranche,
    errorMsg,
    processing,
    setAmount,
    setSelectedTranche,
    setErrorMsg,
    setProcessing,
  } = useWithdrawModalState()
  const router = useRouter()
  const { t } = useTranslation()

  const { modal } = useModalState()
  const { modalStatusAction, setModalStatusAction } = useModalStatusState()

  const poolData = modal.withdrawModal.poolData
  const { account } = useWeb3React()
  const userAddress = useMemo(() => formatAccount(account), [account]) || ''

  const { data, isLoading, error } = useUserPoolBalance(
    poolData?.id,
    userAddress
  )

  console.warn('useUserPoolBalance', error)

  const disabledButton = !amount || !!errorMsg

  const validationStyle = errorMsg
    ? 'light-error-background'
    : 'light-blue-background'

  const isMultiTranche = useMemo(
    () => poolData?.tranches?.length > 1,
    [poolData]
  )

  const onModalClose = () => {
    setAmount('')
    setErrorMsg('')
    setModalStatusAction(ModalStatusAction.REQUEST)
    setSelectedTranche('0x0')
    setProcessing(false)
    handleClose()
    router.push(Routes.lending.root.url)
  }

  if (processing) {
    return <ProcessingModal handleClose={onModalClose} />
  }

  // TODO: Replace with real tx hash
  const txHash =
    modalStatusAction === ModalStatusAction.CONFIRM ? 'test-tx-hash' : ''

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
            metrics={metricsMock}
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
          disabledButton={disabledButton}
        />
      </DialogActions>
    </>
  )
}

export default WithdrawModal
