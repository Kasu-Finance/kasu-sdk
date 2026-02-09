import { PoolOverview } from '@kasufinance/kasu-sdk'
import { Stack } from '@mui/material'
import React, { useCallback } from 'react'

import useModalState from '@/hooks/context/useModalState'

import PoolDropdown from '@/components/molecules/lending/PoolDropdown'
import TrancheDropdown from '@/components/molecules/lending/TrancheDropdown'
import WithdrawAmountInput from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawAmountInput'
import WithdrawFromInfo from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawFromInfo'
import WithdrawModalEditActions from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawModalEditActions'

import { ModalsKeys } from '@/context/modal/modal.types'

import { HexString } from '@/types/lending'

type WithdrawLiteLayoutProps = {
  pool: PoolOverview
  trancheId: `0x${string}` | undefined
  setSelectedTranche: (trancheId: HexString) => void
  setSelectedPool: (pool: PoolOverview) => void
}

const WithdrawLiteLayout: React.FC<WithdrawLiteLayoutProps> = ({
  pool,
  setSelectedTranche,
  setSelectedPool,
  trancheId,
}) => {
  const { modal } = useModalState()

  const { pools } = modal[ModalsKeys.WITHDRAW]

  const handlePoolChange = useCallback(
    (pool: PoolOverview) => {
      setSelectedPool(pool)
      setSelectedTranche(pool.tranches[0].id as `0x${string}`)
    },
    [setSelectedTranche, setSelectedPool]
  )

  return (
    <Stack spacing={3} mt={3}>
      {pools && (
        <PoolDropdown
          pools={pools}
          selectedPool={pool.id}
          handlePoolChange={handlePoolChange}
        />
      )}
      <TrancheDropdown
        tranches={pool?.tranches ?? pool.tranches}
        selectedTranche={trancheId}
        setSelectedTranche={setSelectedTranche}
      />
      <WithdrawFromInfo />
      <WithdrawAmountInput />
      <WithdrawModalEditActions />
    </Stack>
  )
}

export default WithdrawLiteLayout
