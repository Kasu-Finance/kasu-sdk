'use client'

import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import CustomModal from '@/components/molecules/CustomModal'
import HorizontalStepper from '@/components/molecules/HorizontalStepper'
import ProcessingModal from '@/components/organisms/modals/ProcessingModal'
import ApproveForm from '@/components/organisms/modals/WithdrawModal/ApproveForm'
import ConfirmForm from '@/components/organisms/modals/WithdrawModal/ConfirmForm'
import MetricsSection from '@/components/organisms/modals/WithdrawModal/MetricsSection'
import RequestForm from '@/components/organisms/modals/WithdrawModal/RequestForm'

import { ModalsKeys } from '@/context/modal/modal.types'
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
  } = useWithdrawModalState()
  const router = useRouter()
  const { t } = useTranslation()
  const { modal } = useModalState()
  const { modalStatusAction, setModalStatusAction } = useModalStatusState()

  console.warn('modalStatusAction', modalStatusAction)

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
    handleClose()
    router.push(Routes.lending.root.url)
  }

  if (processing) {
    return <ProcessingModal />
  }

  return (
    <CustomModal
      modalKey={ModalsKeys.WITHDRAW}
      title={t('lending.withdraw.title')}
      onAction={onModalClose}
      modalStyles={{
        py: 2,
        top: '50%',
        width: '60%',
        borderRadius: 1,
      }}
      actionIcon={
        modalStatusAction === ModalStatusAction.CONFIRM ? (
          <Button
            component='a'
            href='https://www.newwebsite.com'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            startIcon={<ReceiptIcon />}
          >
            {t('lending.withdraw.button.viewTx')}
          </Button>
        ) : null
      }
    >
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
          poolName={poolData?.poolName || ''}
          trancheName={selectedTranche}
          onSubmit={onModalClose}
        />
      )}
    </CustomModal>
  )
}

export default WithdrawModal
