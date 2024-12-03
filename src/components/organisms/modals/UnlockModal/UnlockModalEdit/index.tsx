import { Stack } from '@mui/material'

import UnlockModalEditActions from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalEditActions'
import UnlockModalEditDescription from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalEditDescription'
import UnlockModalInput from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalInput'
import UnlockModalOverview from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalOverview'
import UnlockRemainingInfo from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockRemainingInfo'

const UnlockModalEdit = () => {
  return (
    <Stack spacing={3} mt={3}>
      <UnlockModalOverview />
      <UnlockModalEditDescription />
      <UnlockRemainingInfo />
      <UnlockModalInput />
      <UnlockModalEditActions />
    </Stack>
  )
}

export default UnlockModalEdit
