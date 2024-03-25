import { Box, Button } from '@mui/material'
import { PoolMetric, PoolOverview } from 'kasu-sdk/src/types'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import CustomModal from '@/components/molecules/CustomModal'
import HorizontalStepper from '@/components/molecules/HorizontalStepper'
import ApproveForm from '@/components/molecules/lending/WithdrawModal/ApproveForm'
import ConfirmForm from '@/components/molecules/lending/WithdrawModal/ConfirmForm'
import MetricsSection from '@/components/molecules/lending/WithdrawModal/MetricsSection'
import RequestForm from '@/components/molecules/lending/WithdrawModal/RequestForm'
import ProcessingModal from '@/components/organisms/modals/ProcessingModal'

import { ModalsKeys } from '@/context/modal/modal.types'

import { TransactionListIcon } from '@/assets/icons'

import { Tranche, WithdrawMetrics, WithdrawSteps } from '@/constants'

const metrics: PoolMetric[] = [
  {
    id: WithdrawMetrics.TOTAL_INVESTMENT,
    content: '100',
    unit: 'USDT',
  },
  {
    id: WithdrawMetrics.TRANCHE_INVESTMENT,
    content: '100',
    unit: 'USDT',
  },
]

interface WithdrawModalProps {
  pool: PoolOverview
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ pool }) => {
  const [amount, setAmount] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [activeStep, setActiveStep] = useState<number>(WithdrawSteps.REQUEST)
  const [processing, setProcessing] = useState<boolean>(false)
  const [selectedTranche, setSelectedTranche] = useState<Tranche>(
    Tranche.SENIOR_TRANCHE
  )
  const { openModal, closeModal } = useModalState()
  const { t } = useTranslation()
  const router = useRouter()

  const isMultiTranche = useMemo(() => pool?.tranches?.length > 1, [pool])

  const validationStyle = errorMsg
    ? 'light-error-background'
    : 'light-blue-background'

  const handleSubmitRequest = () => {
    router.push('/lending?step-2')
    setActiveStep(WithdrawSteps.APPROVE)
  }

  const onModalClose = () => {
    setAmount('')
    setErrorMsg('')
    closeModal(ModalsKeys.WITHDRAW)
    setActiveStep(WithdrawSteps.REQUEST)
    setSelectedTranche(Tranche.SENIOR_TRANCHE)
    router.push('/lending')
  }

  const handleSubmitConfirm = () => {
    setProcessing(true)
    openModal({ name: ModalsKeys.TRANSACTION_PROCESSING })

    setTimeout(() => {
      setProcessing(false)
      setActiveStep(WithdrawSteps.CONFIRM)
      router.push('/lending?step-3')
    }, 2000)
  }

  const handleAdjust = () => {
    setActiveStep(WithdrawSteps.REQUEST)
    router.push('/lending?step-1')
  }

  if (processing) {
    return <ProcessingModal />
  }

  return (
    <CustomModal
      modalKey={ModalsKeys.WITHDRAW}
      title={t('lending.withdraw.title')}
      onAction={onModalClose}
      modalStyles={{ top: '50%', width: '60%' }}
      actionIcon={
        activeStep === WithdrawSteps.CONFIRM ? (
          <Button
            component='a'
            href='https://www.newwebsite.com'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            startIcon={<TransactionListIcon />}
          >
            {t('lending.withdraw.button.viewTx')}
          </Button>
        ) : null
      }
    >
      <Box mt={3} width='100%'>
        <HorizontalStepper
          activeStep={activeStep}
          steps={['Request', 'Approve', 'Confirm']}
        />
      </Box>

      {activeStep !== WithdrawSteps.CONFIRM && (
        <MetricsSection
          metrics={metrics}
          poolName={pool.poolName}
          selectedTranche={selectedTranche}
          activeStep={activeStep}
          isMultiTranche={isMultiTranche}
          metricsRowClassName={validationStyle}
        />
      )}

      {activeStep === WithdrawSteps.REQUEST && (
        <RequestForm
          amount={amount}
          selectedTranche={selectedTranche}
          errorMsg={errorMsg}
          isMultiTranche={isMultiTranche}
          containerClassName={validationStyle}
          setAmount={setAmount}
          setErrorMsg={setErrorMsg}
          onSubmit={handleSubmitRequest}
          setSelectedTranche={setSelectedTranche}
        />
      )}

      {activeStep === WithdrawSteps.APPROVE && (
        <ApproveForm
          handleAdjust={handleAdjust}
          onSubmit={handleSubmitConfirm}
        />
      )}

      {activeStep === WithdrawSteps.CONFIRM && (
        <ConfirmForm
          amount={amount}
          poolName={pool?.poolName || ''}
          trancheName={selectedTranche}
          onSubmit={onModalClose}
        />
      )}
    </CustomModal>
  )
}

export default WithdrawModal
