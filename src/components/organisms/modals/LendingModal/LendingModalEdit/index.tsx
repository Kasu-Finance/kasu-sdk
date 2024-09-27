import { Stack } from '@mui/material'

import Acknowledgement from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'
import ApyDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/ApyDropdown'
import EarningsSimulator from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator'
import LendingModalEditActions from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingModalEditActions'
import SecureSpotInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SecureSpotInfo'
import SelectedAssetInput from '@/components/organisms/modals/LendingModal/LendingModalEdit/SelectedAssetInput'
import SupportedAssetsDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/SupportedAssetsDropdown'
import SwapInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SwapInfo'
import TrancheDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/TrancheDropdown'

const LendingModalEdit = () => {
  return (
    <Stack spacing={3} mt={3}>
      <SupportedAssetsDropdown />
      <SelectedAssetInput />
      <SwapInfo />
      <TrancheDropdown />
      <ApyDropdown />
      <EarningsSimulator />
      <Acknowledgement />
      <SecureSpotInfo />
      <LendingModalEditActions />
    </Stack>
  )
}

export default LendingModalEdit
