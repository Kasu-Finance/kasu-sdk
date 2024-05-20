import { Box, Typography } from '@mui/material'
import { useState } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import DepositAmountInput from '@/components/molecules/lending/DepositModal/DepositAmountInput'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import SimulatedDepositDefault from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositAmount/SimulatedDepositDefault'
import SimulatedSwapAndDeposit from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositAmount/SimulatedSwapAndDeposit'

type SimulatedDepositAmountProps = {
  loyaltyLevel: LoyaltyLevel
  poolData: PoolData
}

const IS_SWAP_AND_DEPOSIT = true

const SimulatedDepositAmount: React.FC<SimulatedDepositAmountProps> = ({
  loyaltyLevel,
  poolData,
}) => {
  const { t } = useTranslation()

  const { modalStatus } = useModalStatusState()

  const [selectedBalance, setSelectedBalance] = useState('0')

  const isLoyal = loyaltyLevel === 1 || loyaltyLevel === 2

  return (
    <Box my={2}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography variant='subtitle1' component='span'>
          {t('modals.earningsCalculator.simulatedAmount.title')}
        </Typography>
        {IS_SWAP_AND_DEPOSIT && (
          <Box display='flex' alignItems='center'>
            <Typography
              variant='body2'
              component='span'
              textTransform='capitalize'
            >
              {t('general.loyaltyLevel')}
            </Typography>
            <Box
              ml={1}
              display='flex'
              alignItems='center'
              bgcolor={(theme) => theme.palette.primary.main}
              color='white'
              height={32}
              px={1}
              borderRadius={1}
            >
              <Typography variant='subtitle2' component='span'>
                {isLoyal
                  ? loyaltyLevel.toString()
                  : t('locking.widgets.loyalty.level.level-0.title')}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 2, mb: 1 }}>
        {IS_SWAP_AND_DEPOSIT ? (
          <SimulatedSwapAndDeposit setSelectedBalance={setSelectedBalance} />
        ) : (
          <SimulatedDepositDefault
            setSelectedBalance={setSelectedBalance}
            loyaltyLabel={
              isLoyal
                ? loyaltyLevel.toString()
                : t('locking.widgets.loyalty.level.level-0.title')
            }
          />
        )}
      </ColoredBox>
      <DepositAmountInput
        decimals={IS_SWAP_AND_DEPOSIT ? 6 : 6}
        balance={selectedBalance}
        poolData={poolData}
      />
    </Box>
  )
}

export default SimulatedDepositAmount
