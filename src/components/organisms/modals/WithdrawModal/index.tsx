'use client'

import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import { useRouter } from 'next/navigation'
import React, { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import usePoolTrancheBalance from '@/hooks/lending/usePoolTrancheBalance'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useWithdrawRequest from '@/hooks/lending/useWithdrawRequest'
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
import { toBigNumber } from '@/utils'

interface WithdrawModalProps {
  handleClose: () => void
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ handleClose }) => {
  const { amount, selectedTranche, processing, setProcessing } =
    useWithdrawModalState()
  const router = useRouter()
  const { t } = useTranslation()

  const { modal } = useModalState()
  const { modalStatus, setModalStatusAction, modalStatusAction } =
    useModalStatusState()

  const poolData = modal.withdrawModal.poolData

  const { requestWithdrawal, data: withdrawResponse } = useWithdrawRequest()
  const { data: userPool } = useUserPoolBalance(poolData?.id)
  const { data: poolTranche } = usePoolTrancheBalance(
    poolData?.id,
    selectedTranche
  )

  const balance = useMemo(() => {
    if (!userPool && !poolTranche) return '0'

    const decimals = 6
    const userPoolBalance = formatUnits(userPool?.balance || '0', decimals)
    const poolTrancheBalance = formatUnits(
      poolTranche?.balance || '0',
      decimals
    )

    const poolBalance = toBigNumber(userPoolBalance)
    const trancheBalance = toBigNumber(poolTrancheBalance)
    const totalBalance = poolBalance.add(trancheBalance)

    return formatUnits(totalBalance, decimals)
  }, [userPool, poolTranche])

  const validationStyle =
    modalStatus.type === 'error'
      ? 'light-error-background'
      : 'light-blue-background'

  const isMultiTranche = useMemo(
    () => poolData?.tranches?.length > 1,
    [poolData]
  )

  const onModalClose = () => {
    handleClose()
    router.push(Routes.lending.root.url)
  }

  const onSubmitApprove = async () => {
    setProcessing(true)
    try {
      const txResponse = await requestWithdrawal(
        poolData.id,
        selectedTranche,
        amount
      )
      console.log('Withdrawal transaction response:', txResponse)

      setModalStatusAction(ModalStatusAction.CONFIRM)
      router.push(`${Routes.lending.root.url}?poolId=${poolData?.id}&step=3`)
    } catch (err) {
      console.error('Withdrawal request failed:', err)
    } finally {
      setProcessing(false)
    }
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
            balance={balance}
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
