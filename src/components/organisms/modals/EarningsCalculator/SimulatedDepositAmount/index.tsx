import { Box, Typography } from '@mui/material'

import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'

import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import SimulatedSwapAndDeposit from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositAmount/SimulatedSwapAndDeposit'

type SimulatedDepositAmountProps = {
  loyaltyLevel: LoyaltyLevel
  poolData: PoolData
}

const SimulatedDepositAmount: React.FC<SimulatedDepositAmountProps> = ({
  loyaltyLevel,
  poolData,
}) => {
  const { t } = useTranslation()

  const isLoyal = loyaltyLevel === 1 || loyaltyLevel === 2

  return (
    <Box my={2}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography variant='subtitle1' component='span'>
          {t('modals.earningsCalculator.simulatedAmount.title')}
        </Typography>

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
      </Box>
      <SimulatedSwapAndDeposit poolData={poolData} />
    </Box>
  )
}

export default SimulatedDepositAmount
