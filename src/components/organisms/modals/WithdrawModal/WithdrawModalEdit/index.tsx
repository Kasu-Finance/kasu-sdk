import useLiteModeState from '@/hooks/context/useLiteModeState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'

import WithdrawLiteLayout from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawLiteLayout'
import WithdrawProLayout from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawProLayout'

const WithdrawModalEdit = () => {
  const { isLiteMode } = useLiteModeState()

  const { trancheId, setSelectedTranche, selectedPool, setSelectedPool } =
    useWithdrawModalState()

  const props = {
    trancheId,
    pool: selectedPool,
    setSelectedTranche,
    setSelectedPool,
  }

  return isLiteMode ? (
    <WithdrawLiteLayout {...props} />
  ) : (
    <WithdrawProLayout {...props} />
  )
}

export default WithdrawModalEdit
