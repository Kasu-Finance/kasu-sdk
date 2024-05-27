import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/navigation'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useRequestDeposit from '@/hooks/lending/useRequestDeposit'
import useTranslation from '@/hooks/useTranslation'
import useApproveToken from '@/hooks/web3/useApproveToken'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import DepositModalCompleted from '@/components/organisms/modals/DepositModal/DepositModalCompleted'
import DepositModalEdit from '@/components/organisms/modals/DepositModal/DepositModalEdit'
import DepositModalReview from '@/components/organisms/modals/DepositModal/DepositModalReview'
import DepositModalStepper from '@/components/organisms/modals/DepositModal/DepositModalStepper'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { Routes } from '@/config/routes'
import sdkConfig, { USDC } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'

const DepositModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()
  const router = useRouter()

  const { chainId } = useWeb3React()

  const { modal } = useModalState()

  const { amount, trancheId, txHash } = useDepositModalState()

  const { modalStatus, modalStatusAction, setModalStatusAction } =
    useModalStatusState()

  const { isApproved, approve } = useApproveToken(
    USDC,
    sdkConfig.contracts.LendingPoolManager,
    amount
  )

  const requestDeposit = useRequestDeposit()

  const poolData = modal.depositModal.poolData

  const onCloseModal = () => {
    handleClose()
    router.push(`${Routes.lending.root.url}/${poolData.lendingPoolId}`)
  }

  return (
    <>
      <DialogHeader
        title='Deposit Funds'
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
            VIEW TX
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
                  isApproved
                    ? requestDeposit(poolData.lendingPoolId, trancheId, amount)
                    : approve(amount)
                }
              >
                {isApproved ? t('general.confirm') : t('general.approve')}
              </Button>
            </>
          ) : (
            <Button
              variant='contained'
              sx={{ width: 235 }}
              onClick={onCloseModal}
            >
              LENDING POOL OVERVIEW
            </Button>
          )}
        </DialogActions>
      )}
    </>
  )
}

export default DepositModal
