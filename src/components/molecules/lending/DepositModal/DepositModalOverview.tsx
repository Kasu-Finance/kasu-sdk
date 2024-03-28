import { Grid } from '@mui/material'

import useModalStatusState from '@/hooks/context/useModalStatusState'

import ColoredBox from '@/components/atoms/ColoredBox'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { formatAmount } from '@/utils'

type DepositModalOverviewProps = {
  userBalance: string
  poolData: PoolData
}

const DepositModalOverview: React.FC<DepositModalOverviewProps> = ({
  userBalance,
  poolData,
}) => {
  const { modalStatus } = useModalStatusState()

  return (
    <ColoredBox sx={{ bgcolor: modalStatus.bgColor }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <BalanceItem
            title='Available Funds'
            toolTipInfo='info'
            value={[
              formatAmount(userBalance, {
                minDecimals: 2,
              }),
              'USDC',
            ]}
          />
        </Grid>
        <Grid item xs={6}>
          <BalanceItem
            title='Total Investent'
            toolTipInfo='info'
            value={[
              formatAmount(poolData.totalUserInvestment, { minDecimals: 2 }),
              'USDC',
            ]}
          />
        </Grid>
      </Grid>
    </ColoredBox>
  )
}

export default DepositModalOverview
