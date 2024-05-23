import { Box, DialogContent, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import DepositTrancheSelect from '@/components/molecules/lending/DepositModal/DepositTrancheSelect'
import EarningsCalculatorActions from '@/components/organisms/modals/EarningsCalculator/EarningsCalculatorActions'
import SimulatedDepositAmount from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositAmount'
import SimulatedDepositDuration from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositDuration'
import SimulatedYieldEarnings from '@/components/organisms/modals/EarningsCalculator/SimulatedYieldEarnings'

const EarningsCalculatorModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { modalStatus } = useModalStatusState()

  const stakedPercentage = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  const poolData = modal.earningsCalculatorModal.poolData

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
            loyaltyLevel={currentLevel}
            poolData={poolData}
          />
          <DepositTrancheSelect
            selectProps={{ size: 'small' }}
            poolData={poolData}
          />
          <SimulatedDepositDuration />
          <SimulatedYieldEarnings
            loyaltyLevel={currentLevel}
            poolOverview={modal.earningsCalculatorModal.poolOverview}
          />
        </Box>
      </DialogContent>
      <EarningsCalculatorActions poolData={poolData} />
    </>
  )
}

export default EarningsCalculatorModal
