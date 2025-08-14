import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'

import WithdrawLiteLayout from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawLiteLayout'
import WithdrawProLayout from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit/WithdrawProLayout'

import { ModalsKeys } from '@/context/modal/modal.types'

const WithdrawModalEdit = () => {
  const { isLiteMode } = useLiteModeState()

  const { modal } = useModalState()

  const { trancheId, setSelectedTranche } = useWithdrawModalState()

  const { pool } = modal[ModalsKeys.WITHDRAW]

  const props = {
    trancheId,
    pool,
    setSelectedTranche,
  }

  return isLiteMode ? (
    <WithdrawLiteLayout {...props} />
  ) : (
    <WithdrawProLayout {...props} />
  )
}

export default WithdrawModalEdit
