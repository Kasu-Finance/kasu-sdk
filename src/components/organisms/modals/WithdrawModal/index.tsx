'use client'

import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import usePoolTrancheBalance from '@/hooks/lending/usePoolTrancheBalance'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useWithdrawRequest from '@/hooks/lending/useWithdrawRequest'
import useTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import DialogHeader from '@/components/molecules/DialogHeader'
import HorizontalStepper from '@/components/molecules/HorizontalStepper'
import WithdrawModalActions from '@/components/organisms/modals/WithdrawModal/WithdrawModalActions'
import WithdrawModalApprove from '@/components/organisms/modals/WithdrawModal/WithdrawModalApprove'
import WithdrawModalConfirm from '@/components/organisms/modals/WithdrawModal/WithdrawModalConfirm'
import WithdrawModalRequest from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest'
import WithdrawModalMetrics from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/WithdrawModalMetrics'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { Routes } from '@/config/routes'
import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { SupportedTokens } from '@/constants/tokens'

interface WithdrawModalProps {
  handleClose: () => void
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ handleClose }) => {
  const { amount, selectedTranche } = useWithdrawModalState()

  const { chainId } = useWeb3React()

  const router = useRouter()
  const { t } = useTranslation()

  const { modal } = useModalState()
  const { modalStatus, setModalStatusAction, modalStatusAction } =
    useModalStatusState()

  const poolData = modal.withdrawModal.poolOverview

  const { requestWithdrawal, data: withdrawTransaction } = useWithdrawRequest()
  const { data: userPoolBalance } = useUserPoolBalance(poolData?.id)
  const { data: poolTranche } = usePoolTrancheBalance(
    poolData?.id,
    selectedTranche
  )

  const supportedToken = useSupportedTokenInfo()

  const usdcDecimals = supportedToken?.[SupportedTokens.USDC].decimals

  const poolBalance = useMemo(() => {
    if (!userPoolBalance) return '0'
    return formatUnits(userPoolBalance?.balance || '0', usdcDecimals)
  }, [userPoolBalance, usdcDecimals])

  const { availableToWithdraw, trancheBalance } = useMemo(() => {
    if (!poolTranche) {
      return { availableToWithdraw: '0', trancheBalance: '0' }
    }

    const formattedAvailableToWithdraw = formatUnits(
      poolTranche?.availableToWithdraw || '0',
      usdcDecimals
    )

    const formattedTrancheBalance = formatUnits(
      poolTranche?.balance || '0',
      usdcDecimals
    )

    return {
      availableToWithdraw: formattedAvailableToWithdraw,
      trancheBalance: formattedTrancheBalance,
    }
  }, [poolTranche, usdcDecimals])

  const isMultiTranche = useMemo(
    () => poolData?.tranches?.length > 1,
    [poolData]
  )

  const txHash = withdrawTransaction?.hash

  const validationStyle =
    modalStatus.type === 'error'
      ? 'light-error-background'
      : 'light-colored-background'

  const onModalClose = () => {
    handleClose()
    router.push(`${Routes.lending.root.url}/${poolData.id}`)
  }

  const onSubmitApprove = async () => {
    try {
      const isMaxWithdrawal = amount === availableToWithdraw
      const transaction = await requestWithdrawal(
        poolData.id,
        selectedTranche,
        parseUnits(amount, usdcDecimals),
        { isWithdrawMax: isMaxWithdrawal }
      )

      if (!transaction) return

      setModalStatusAction(ModalStatusAction.CONFIRM)
      router.push(`${Routes.lending.root.url}/${poolData.id}?step=3`)
    } catch (error) {
      console.error('Failed to request withdrawal:', error)
    }
  }

  return (
    <>
      <DialogHeader
        title={t('lending.withdraw.title')}
        showClose={!txHash}
        containerSx={{ mt: 1 }}
        onClose={onModalClose}
      >
        {txHash && (
          <Button
            sx={{ height: 30, width: 97, p: '4px 10px' }}
            variant='outlined'
            startIcon={<ReceiptIcon />}
            href={`${
              networks[(chainId as SupportedChainIds) || SupportedChainIds.BASE]
                .blockExplorerUrls[0]
            }/tx/${txHash}`}
            target='_blank'
          >
            {t('lending.withdraw.button.viewTx')}
          </Button>
        )}
      </DialogHeader>
      <DialogContent>
        <Box width='100%'>
          <HorizontalStepper
            activeStep={modalStatusAction as number}
            steps={['Request', 'Approve', 'Confirm']}
          />
        </Box>
        {modalStatusAction !== ModalStatusAction.CONFIRM && (
          <WithdrawModalMetrics
            amount={amount}
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
            balance={availableToWithdraw}
            isMultiTranche={isMultiTranche}
            containerClassName={validationStyle}
          />
        )}
        {modalStatusAction === ModalStatusAction.APPROVE && (
          <WithdrawModalApprove />
        )}
        {modalStatusAction === ModalStatusAction.CONFIRM && (
          <WithdrawModalConfirm
            poolData={poolData}
            isMultiTranche={isMultiTranche}
          />
        )}
      </DialogContent>
      <DialogActions>
        <WithdrawModalActions
          poolData={poolData}
          trancheBalance={trancheBalance}
          onModalClose={onModalClose}
          onSubmitApprove={onSubmitApprove}
        />
      </DialogActions>
    </>
  )
}

export default WithdrawModal
