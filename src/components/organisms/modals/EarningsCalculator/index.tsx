import ChevronRight from '@mui/icons-material/ChevronRight'
import { Box, DialogActions, DialogContent, Typography } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import KycButton from '@/components/atoms/KycButton'
import DialogHeader from '@/components/molecules/DialogHeader'
import DepositTrancheSelect from '@/components/molecules/lending/DepositModal/DepositTrancheSelect'
import SimulatedDepositAmount from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositAmount'
import SimulatedDepositDuration from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositDuration'
import SimulatedYieldEarnings from '@/components/organisms/modals/EarningsCalculator/SimulatedYieldEarnings'

import { USDC } from '@/config/sdk'

const EarningsCalculatorModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation()

  const { modal, openModal, closeModal } = useModalState()

  const { modalStatus } = useModalStatusState()

  const { amount } = useDepositModalState()

  const stakedPercentage = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  const { balance, decimals } = useUserBalance(USDC)

  const userBalance = formatUnits(balance || '0', decimals)

  const poolData = modal.earningsCalculatorModal.poolData

  const handleOpen = () => {
    openModal({ name: 'depositModal', poolData })
    closeModal('earningsCalculatorModal')
  }

  return (
    <>
      <DialogHeader
        title={t('modals.earningsCalculator.title')}
        onClose={handleClose}
      />
      <DialogContent>
        <Box
          sx={{
            backgroundColor: modalStatus.bgColor,
            transition: 'background-color 0.3s ease',
            p: 1,
          }}
        >
          <Typography variant='body2' component='p'>
            {t('modals.earningsCalculator.subtitle')}
          </Typography>
          <SimulatedDepositAmount
            userBalance={userBalance}
            loyaltyLevel={currentLevel}
            poolData={poolData}
          />
          <DepositTrancheSelect poolData={poolData} />
          <SimulatedDepositDuration />
          <SimulatedYieldEarnings loyaltyLevel={currentLevel} />
        </Box>
      </DialogContent>

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
    </>
  )
}

export default EarningsCalculatorModal
