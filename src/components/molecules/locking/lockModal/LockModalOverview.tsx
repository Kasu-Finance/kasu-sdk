import { Grid } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import React from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useStakedKSU from '@/hooks/locking/useStakedKSU'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

type LockModalOverviewProps = {
  balance: string
}

const LockModalOverview: React.FC<LockModalOverviewProps> = ({ balance }) => {
  const { t } = useTranslation()
  const { stakedKSU } = useStakedKSU()

  const { lockState } = useLockModalState()

  return (
    <ColoredBox sx={{ bgcolor: lockState.bgColor }}>
      <Grid container spacing={2}>
        <Grid item container xs={6}>
          <BalanceItem
            title={`${t('general.wallet')} ${t('general.balance')}`}
            toolTipInfo='info'
            value={[balance, 'KSU']}
            subValue={[formatUnits('100000000000000000000000', 18), 'USDC']}
          />
          <BalanceItem
            title='Available Funds'
            toolTipInfo='info'
            value={[formatUnits('100000000000000000000000', 18), 'USDC']}
          />
        </Grid>
        <Grid item xs={6}>
          <BalanceItem
            title='Total KSU Locked'
            toolTipInfo='info'
            value={[stakedKSU?.toString() ?? '0.00', 'KSU']}
          />
        </Grid>
      </Grid>
    </ColoredBox>
  )
}

export default LockModalOverview
