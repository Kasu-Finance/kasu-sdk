'use client'

import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
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
import {
  Tranche,
  WithdrawProgress,
} from '@/context/withdrawModal/withdrawModal.types'

import { metricsMock, mockedPoolOverview } from '@/app/mock-data/withdrawMock'
import { Routes } from '@/config/routes'

interface WithdrawModalProps {
  handleClose: () => void
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ handleClose }) => {
  const {
    amount,
    selectedTranche,
    withdrawProgress,
    errorMsg,
    processing,
    setAmount,
    setSelectedTranche,
    setWithdrawProgress,
    setErrorMsg,
  } = useWithdrawModalState()

  const [poolId, setPoolId] = useState<string>('')

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
    () => pool?.find((p) => p.id === poolId) || mockedPoolOverview, // TODO: remove mocked data
    [poolId, pool]
  )

  const isMultiTranche = useMemo(
    () => selectedPool?.tranches?.length > 1,
    [selectedPool]
  )

  const validationStyle = errorMsg
    ? 'light-error-background'
    : 'light-blue-background'

  const onModalClose = () => {
    setAmount('')
    setErrorMsg('')
    setWithdrawProgress(WithdrawProgress.REQUEST)
    setSelectedTranche(Tranche.SENIOR_TRANCHE)
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
        withdrawProgress === WithdrawProgress.CONFIRM ? (
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
          activeStep={withdrawProgress}
          steps={['Request', 'Approve', 'Confirm']}
        />
      </Box>

      {withdrawProgress !== WithdrawProgress.CONFIRM && (
        <MetricsSection
          metrics={metricsMock}
          poolName={selectedPool?.poolName || ''}
          selectedTranche={selectedTranche}
          withdrawProgress={withdrawProgress}
          isMultiTranche={isMultiTranche}
          metricsRowClassName={validationStyle}
        />
      )}

      {withdrawProgress === WithdrawProgress.REQUEST && (
        <RequestForm
          pool={selectedPool}
          isMultiTranche={isMultiTranche}
          containerClassName={validationStyle}
        />
      )}

      {withdrawProgress === WithdrawProgress.APPROVE && (
        <ApproveForm pool={selectedPool} />
      )}

      {withdrawProgress === WithdrawProgress.CONFIRM && (
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
