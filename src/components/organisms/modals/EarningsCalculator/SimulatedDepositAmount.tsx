import { Box, Grid, Typography } from '@mui/material'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import DepositAmountInput from '@/components/molecules/lending/DepositModal/DepositAmountInput'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { formatAmount } from '@/utils'

type SimulatedDepositAmountProps = {
  userBalance: string
  loyaltyLevel: LoyaltyLevel
  poolData: PoolData
}

const SimulatedDepositAmount: React.FC<SimulatedDepositAmountProps> = ({
  loyaltyLevel,
  userBalance,
  poolData,
}) => {
  const { t } = useTranslation()

  const { modalStatus } = useModalStatusState()

  const isLoyal = loyaltyLevel === 1 || loyaltyLevel === 2

  return (
    <Box my={2}>
      <Typography variant='subtitle1' component='span'>
        {t('modals.earningsCalculator.simulatedAmount.title')}
      </Typography>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 2, mb: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <BalanceItem
              title={t('general.availableFunds')}
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedAmount.metric-1-tooltip'
              )}
              value={[formatAmount(userBalance || '0'), 'USDC']}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title={t('general.loyaltyLevel')}
              titleStyle={{ textTransform: 'capitalize' }}
              showDivider
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedAmount.metric-2-tooltip'
              )}
              metric={
                <Typography
                  variant='h6'
                  component='span'
                  display='block'
                  pt='6px'
                  pl={2}
                >
                  {isLoyal
                    ? loyaltyLevel.toString()
                    : t('locking.widgets.loyalty.level.level-0.title')}
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </ColoredBox>
      <DepositAmountInput balance={userBalance} poolData={poolData} />
    </Box>
  )
}

export default SimulatedDepositAmount
