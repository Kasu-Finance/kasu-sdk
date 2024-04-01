'use client'

import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button, DialogContent } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import DialogHeader from '@/components/molecules/DialogHeader'
import HorizontalStepper from '@/components/molecules/HorizontalStepper'
import ProcessingModal from '@/components/organisms/modals/ProcessingModal'
import ApproveForm from '@/components/organisms/modals/WithdrawModal/ApproveForm'
import ConfirmForm from '@/components/organisms/modals/WithdrawModal/ConfirmForm'
import MetricsSection from '@/components/organisms/modals/WithdrawModal/MetricsSection'
import RequestForm from '@/components/organisms/modals/WithdrawModal/RequestForm'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { metricsMock } from '@/app/mock-data/withdrawMock'
import { Routes } from '@/config/routes'

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

  const isMultiTranche = useMemo(
    () => poolData?.tranches?.length > 1,
    [poolData]
  )

  const validationStyle = errorMsg
    ? 'light-error-background'
    : 'light-blue-background'

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
          <MetricsSection
            metrics={metricsMock}
            poolName={poolData?.poolName || ''}
            selectedTranche={selectedTranche}
            modalStatusAction={modalStatusAction as number}
            isMultiTranche={isMultiTranche}
            metricsRowClassName={validationStyle}
          />
        )}

        {modalStatusAction === ModalStatusAction.REQUEST && (
          <RequestForm
            poolData={poolData}
            isMultiTranche={isMultiTranche}
            containerClassName={validationStyle}
          />
        )}

        {modalStatusAction === ModalStatusAction.APPROVE && (
          <ApproveForm pool={poolData} />
        )}

        {modalStatusAction === ModalStatusAction.CONFIRM && (
          <ConfirmForm
            amount={amount}
            poolData={poolData}
            onSubmit={onModalClose}
          />
        )}
      </DialogContent>
    </>
  )
}

export default WithdrawModal
