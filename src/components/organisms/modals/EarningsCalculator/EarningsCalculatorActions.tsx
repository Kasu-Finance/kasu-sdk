import ChevronRight from '@mui/icons-material/ChevronRight'
import { DialogActions } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'

import KycButton from '@/components/atoms/KycButton'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PoolData } from '@/utils/lending/getPoolData'

type EarningsCalculatorActionsProps = {
  poolData: PoolData
}

const EarningsCalculatorActions: React.FC<EarningsCalculatorActionsProps> = ({
  poolData,
}) => {
  const { t } = useTranslation()

  const { openModal, closeModal } = useModalState()

  const { modalStatus } = useModalStatusState()

  const { amount, amountInUSD, trancheId, selectedToken } =
    useDepositModalState()

  const handleOpen = () => {
    openModal({
      name: ModalsKeys.DEPOSIT,
      poolData,
      initialAmount: amount,
      initialUsdAmount: amountInUSD,
      initialTranche: trancheId,
      initialToken: selectedToken,
    })
    closeModal(ModalsKeys.EARNINGS_CALCULATOR)
  }

  return (
    <DialogActions
      disableSpacing
      sx={{ justifyContent: 'center', pt: 0, pb: 3, gap: 2 }}
    >
      <KycButton
        variant='contained'
        disabled={Boolean(!amount || modalStatus.type === 'error')}
        endIcon={<ChevronRight />}
        onClick={handleOpen}
      >
        {t('general.requestDeposit')}
      </KycButton>
    </DialogActions>
  )
}

export default EarningsCalculatorActions
