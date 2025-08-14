import { Stack } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import React, { useCallback, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'

import PoolDropdown from '@/components/molecules/lending/PoolDropdown'
import TrancheDropdown from '@/components/molecules/lending/TrancheDropdown'
import WithdrawAmountInput from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawAmountInput'
import WithdrawFromInfo from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawFromInfo'
import WithdrawModalEditActions from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawModalEditActions'

import { ModalsKeys } from '@/context/modal/modal.types'

import { HexString } from '@/types/lending'
import { PoolOverviewWithDelegate } from '@/types/page'

type WithdrawLiteLayoutProps = {
  pool: PoolOverviewWithDelegate
  trancheId: `0x${string}` | undefined
  setSelectedTranche: (trancheId: HexString) => void
}

const WithdrawLiteLayout: React.FC<WithdrawLiteLayoutProps> = ({
  pool,
  setSelectedTranche,
  trancheId,
}) => {
  const { modal } = useModalState()

  const { pools } = modal[ModalsKeys.WITHDRAW]

  const [selectedPool, setSelectedPool] = useState(pool.id)

  const handlePoolChange = useCallback(
    (pool: PoolOverview) => {
      setSelectedPool(pool.id)
      setSelectedTranche(pool.tranches[0].id as `0x${string}`)
    },
    [setSelectedTranche]
  )

  const selected = pools?.find((pool) => pool.id === selectedPool)

  return (
    <Stack spacing={3} mt={3}>
      {pools && (
        <PoolDropdown
          pools={pools}
          selectedPool={selectedPool}
          handlePoolChange={handlePoolChange}
        />
      )}
      <TrancheDropdown
        tranches={selected?.tranches ?? pool.tranches}
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
