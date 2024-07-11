import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/navigation'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useCurrentEpochDepositedAmount from '@/hooks/lending/useCurrentEpochDepositedAmount'
import useRequestDeposit from '@/hooks/lending/useRequestDeposit'
import useTranslation from '@/hooks/useTranslation'
import useApproveToken from '@/hooks/web3/useApproveToken'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import DepositModalCompleted from '@/components/organisms/modals/DepositModal/DepositModalCompleted'
import DepositModalEdit from '@/components/organisms/modals/DepositModal/DepositModalEdit'
import DepositModalReview from '@/components/organisms/modals/DepositModal/DepositModalReview'
import DepositModalStepper from '@/components/organisms/modals/DepositModal/DepositModalStepper'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { Routes } from '@/config/routes'
import sdkConfig from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { SupportedTokens } from '@/constants/tokens'

const DepositModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()
  const router = useRouter()

  const { chainId } = useWeb3React()

  const { modal } = useModalState()

  const poolData = modal.depositModal.poolData

  const { amount, selectedToken, txHash, trancheId } = useDepositModalState()

  const supportedToken = useSupportedTokenInfo()

  const { currentEpochDepositedAmount } = useCurrentEpochDepositedAmount(
    poolData.lendingPoolId,
    trancheId
  )

  const { modalStatus, modalStatusAction, setModalStatusAction } =
    useModalStatusState()

  const { isApproved, approve } = useApproveToken(
    supportedToken?.[selectedToken].address,
    sdkConfig.contracts.LendingPoolManager,
    amount
  )

  const requestDeposit = useRequestDeposit()

  const onCloseModal = () => {
    handleClose()
    router.push(`${Routes.lending.root.url}/${poolData.lendingPoolId}`)
  }

  const approvalRequired = !isApproved && selectedToken !== SupportedTokens.ETH

  const handleRequestDeposit = () => {
    if (!currentEpochDepositedAmount) {
      return console.error(
        'RequestDeposit:: currentEpochDepositedAmount is undefined'
      )
    }

    const selectedTranche = poolData.tranches.find(
      (tranche) => tranche.trancheId === trancheId
    )

    if (!selectedTranche) {
      return console.error('RequestDeposit:: Selected tranche not found.')
    }

    requestDeposit(
      poolData.lendingPoolId,
      selectedTranche,
      currentEpochDepositedAmount
    )
  }

  return (
    <>
      <DialogHeader
        title={t('modals.lending.title')}
        showClose={!txHash}
        onClose={handleClose}
      >
        {txHash && (
          <Button
            sx={{ width: 97, p: '4px 10px' }}
            variant='contained'
            startIcon={<ReceiptIcon />}
            href={`${
              networks[(chainId as SupportedChainIds) || SupportedChainIds.BASE]
                .blockExplorerUrls[0]
            }/tx/${txHash}`}
            target='_blank'
            size='small'
          >
            {t('lending.withdraw.button.viewTx')}
          </Button>
        )}
      </DialogHeader>
      <DialogContent>
        <Box
          sx={{
            backgroundColor: modalStatus.bgColor,
            transition: 'background-color 0.3s ease',
            p: 1,
          }}
        >
          <DepositModalStepper />
          {modalStatusAction === ModalStatusAction.REVIEWING ? (
            <DepositModalReview poolData={poolData} />
          ) : modalStatusAction === ModalStatusAction.EDITING ? (
            <DepositModalEdit poolData={poolData} />
          ) : (
            <DepositModalCompleted poolData={poolData} />
          )}
        </Box>
      </DialogContent>
      {modalStatusAction !== ModalStatusAction.EDITING && (
        <DialogActions
          disableSpacing
          sx={{ justifyContent: 'center', pt: 0, pb: 3, gap: 2 }}
        >
          {modalStatusAction === ModalStatusAction.REVIEWING ? (
            <>
              <Button
                variant='outlined'
                startIcon={<EditIcon />}
                onClick={() => setModalStatusAction(ModalStatusAction.EDITING)}
              >
                {t('general.adjust')}
              </Button>
              <Button
                variant='contained'
                endIcon={<ChevronRightIcon />}
                onClick={() =>
                  !approvalRequired ? handleRequestDeposit() : approve(amount)
                }
              >
                {!approvalRequired
                  ? t('general.confirm')
                  : t('general.approve')}
              </Button>
            </>
          ) : (
            <Button
              variant='contained'
              sx={{ width: 264 }}
              onClick={onCloseModal}
            >
              {t('modals.lending.buttons.overview')}
            </Button>
          )}
        </DialogActions>
      )}
    </>
  )
}

export default DepositModal
