import { Stack } from '@mui/material'

import SupportedAssetsDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/SupportedAssetsDropdown'

const LendingModalEdit = () => {
  return (
    <Stack spacing={3} mt={3}>
      <SupportedAssetsDropdown />
    </Stack>
  )
}

export default LendingModalEdit
