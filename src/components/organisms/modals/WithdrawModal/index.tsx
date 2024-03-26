'use client'

import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button } from '@mui/material'
import { PoolMetric } from 'kasu-sdk/src/types'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import usePoolOverview from '@/hooks/lending/usePoolOverview'
import useTranslation from '@/hooks/useTranslation'

import CustomModal from '@/components/molecules/CustomModal'
import HorizontalStepper from '@/components/molecules/HorizontalStepper'
import ProcessingModal from '@/components/organisms/modals/ProcessingModal'
import ApproveForm from '@/components/organisms/modals/WithdrawModal/ApproveForm'
import ConfirmForm from '@/components/organisms/modals/WithdrawModal/ConfirmForm'
import MetricsSection from '@/components/organisms/modals/WithdrawModal/MetricsSection'
import RequestForm from '@/components/organisms/modals/WithdrawModal/RequestForm'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'
import {
  Tranche,
  WithdrawMetrics,
  WithdrawSteps,
} from '@/constants/lending/withdraw'

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
  handleClose: () => void
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ handleClose }) => {
  const [amount, setAmount] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [activeStep, setActiveStep] = useState<number>(WithdrawSteps.REQUEST)
  const [processing, setProcessing] = useState<boolean>(false)
  const [selectedTranche, setSelectedTranche] = useState<Tranche>(
    Tranche.SENIOR_TRANCHE
  )
  const [poolId, setPoolId] = useState<string>('')

  const { openModal } = useModalState()
  const { t } = useTranslation()

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const id = searchParams.get('poolId')
    if (id) {
      setPoolId(id)
    }
  }, [searchParams])

  const { data: pool } = usePoolOverview(poolId)

  const selectedPool = useMemo(
    () => pool?.find((p) => p.id === poolId),
    [poolId, pool]
  )

  const isMultiTranche = useMemo(
    () => selectedPool?.tranches?.length === 0,
    [selectedPool]
  )

  const validationStyle = errorMsg
    ? 'light-error-background'
    : 'light-blue-background'

  const handleSubmitRequest = () => {
    router.push(`${Routes.lending.root.url}?poolId=${selectedPool?.id}&step=2`)
    setActiveStep(WithdrawSteps.APPROVE)
  }

  const onModalClose = () => {
    setAmount('')
    setErrorMsg('')
    setActiveStep(WithdrawSteps.REQUEST)
    setSelectedTranche(Tranche.SENIOR_TRANCHE)
    handleClose()
    router.push(Routes.lending.root.url)
  }

  const handleSubmitConfirm = () => {
    setProcessing(true)
    openModal({ name: ModalsKeys.TRANSACTION_PROCESSING })

    setTimeout(() => {
      setProcessing(false)
      setActiveStep(WithdrawSteps.CONFIRM)
      router.push(
        `${Routes.lending.root.url}?poolId=${selectedPool?.id}&step=3`
      )
    }, 2000)
  }

  const handleAdjust = () => {
    setActiveStep(WithdrawSteps.REQUEST)
    router.push(`${Routes.lending.root.url}?poolId=${selectedPool?.id}&step=1`)
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
        activeStep === WithdrawSteps.CONFIRM ? (
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
          activeStep={activeStep}
          steps={['Request', 'Approve', 'Confirm']}
        />
      </Box>

      {activeStep !== WithdrawSteps.CONFIRM && (
        <MetricsSection
          metrics={metrics}
          poolName={selectedPool?.poolName || ''}
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
          poolName={selectedPool?.poolName || ''}
          trancheName={selectedTranche}
          onSubmit={onModalClose}
        />
      )}
    </CustomModal>
  )
}

export default WithdrawModal
