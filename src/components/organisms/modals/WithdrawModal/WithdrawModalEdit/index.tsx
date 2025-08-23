import { Stack } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'

import TrancheDropdown from '@/components/molecules/lending/TrancheDropdown'
import WithdrawAmountInput from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawAmountInput'
import WithdrawFromInfo from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawFromInfo'
import WithdrawModalEditActions from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawModalEditActions'

import { ModalsKeys } from '@/context/modal/modal.types'

const WithdrawModalEdit = () => {
  const { modal } = useModalState()

  const { trancheId, setSelectedTranche } = useWithdrawModalState()

  const pool = modal[ModalsKeys.WITHDRAW].pool

  return (
    <Stack spacing={3} mt={3}>
      <WithdrawFromInfo />
      <TrancheDropdown
        tranches={pool.tranches}
        selectedTranche={trancheId}
        setSelectedTranche={setSelectedTranche}
        isWithdrawal
      />
      <WithdrawAmountInput />
      <WithdrawModalEditActions />
    </Stack>
  )
}

export default WithdrawModalEdit
