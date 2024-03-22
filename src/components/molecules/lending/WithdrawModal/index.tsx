import { Box } from '@mui/material'
import { PoolMetric, PoolOverview } from 'kasu-sdk/src/types'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'

import CustomModal from '@/components/molecules/CustomModal'
import HorizontalStepper from '@/components/molecules/HorizontalStepper'
import MetricsSection from '@/components/molecules/lending/WithdrawModal/MetricsSection'
import WithdrawForm from '@/components/molecules/lending/WithdrawModal/WithdrawForm'

import { ModalsKeys } from '@/context/modal/modal.types'

import { WithdrawMetrics, WithdrawSteps } from '@/constants'

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

  const router = useRouter()
  const isMultiTranche = useMemo(() => pool?.tranches?.length > 1, [pool])

  const validationStyle = errorMsg
    ? 'light-error-background'
    : 'light-blue-background'

  const metricsFiltered = useMemo(
    () =>
      (!isMultiTranche &&
        metrics.filter(
          (metric) => metric.id !== WithdrawMetrics.TRANCHE_INVESTMENT
        )) ||
      metrics,
    [isMultiTranche]
  )

  const handleSubmit = () => {
    router.push('/lending?step-2')
    setActiveStep(WithdrawSteps.APPROVE)
  }

  const onClose = () => {
    setAmount('')
    setErrorMsg('')
    router.push('/lending')
    setActiveStep(WithdrawSteps.REQUEST)
  }

  return (
    <CustomModal
      modalKey={ModalsKeys.WITHDRAW}
      title={`Withdraw from ${pool?.poolName || ''}`}
      onClose={onClose}
      modalStyles={{ top: '50%', width: '60%' }}
    >
      <Box mt={3} width='100%'>
        <HorizontalStepper
          activeStep={activeStep}
          steps={['Request', 'Approve', 'Confirm']}
        />
      </Box>

      <MetricsSection
        metrics={metricsFiltered}
        poolName={pool.poolName}
        metricsRowClassName={validationStyle}
      />

      <WithdrawForm
        amount={amount}
        errorMsg={errorMsg}
        isMultiTranche={isMultiTranche}
        containerClassName={validationStyle}
        setAmount={setAmount}
        setErrorMsg={setErrorMsg}
        handleSubmit={handleSubmit}
      />
    </CustomModal>
  )
}

export default WithdrawModal
