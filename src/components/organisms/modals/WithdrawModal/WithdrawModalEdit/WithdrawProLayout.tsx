import { PoolOverview } from '@kasufinance/kasu-sdk'
import { Stack } from '@mui/material'
import React from 'react'

import TrancheDropdown from '@/components/molecules/lending/TrancheDropdown'
import WithdrawAmountInput from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawAmountInput'
import WithdrawFromInfo from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawFromInfo'
import WithdrawModalEditActions from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawModalEditActions'

import { HexString } from '@/types/lending'

type WithdrawProLayoutProps = {
  pool: PoolOverview
  trancheId: `0x${string}` | undefined
  setSelectedTranche: (trancheId: HexString) => void
}

const WithdrawProLayout: React.FC<WithdrawProLayoutProps> = ({
  pool,
  setSelectedTranche,
  trancheId,
}) => (
  <Stack spacing={3} mt={3}>
    <WithdrawFromInfo />
    <TrancheDropdown
      tranches={pool.tranches}
      selectedTranche={trancheId}
      setSelectedTranche={setSelectedTranche}
    />
    <WithdrawAmountInput />
    <WithdrawModalEditActions />
  </Stack>
)

export default WithdrawProLayout
