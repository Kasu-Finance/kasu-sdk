import { Stack } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'

import TrancheDropdown from '@/components/molecules/lending/TrancheDropdown'
import Acknowledgement from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'
import ApyDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/ApyDropdown'
import EarningsSimulator from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator'
import LendingModalEditActions from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingModalEditActions'
import SecureSpotInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SecureSpotInfo'
import SelectedAssetInput from '@/components/organisms/modals/LendingModal/LendingModalEdit/SelectedAssetInput'
import SupportedAssetsDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/SupportedAssetsDropdown'
import SwapInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SwapInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

const LendingModalEdit = () => {
  const { modal } = useModalState()

  const { trancheId, setSelectedTranche } = useDepositModalState()

  const pool = modal[ModalsKeys.LEND].pool

  return (
    <Stack spacing={3} mt={3}>
      <SupportedAssetsDropdown />
      <SelectedAssetInput />
      <SwapInfo />
      <TrancheDropdown
        tranches={pool.tranches}
        selectedTranche={trancheId}
        setSelectedTranche={setSelectedTranche}
        disableOversubscribed
      />
      <ApyDropdown />
      <EarningsSimulator />
      <Acknowledgement />
      <SecureSpotInfo />
      <LendingModalEditActions />
    </Stack>
  )
}

export default LendingModalEdit
