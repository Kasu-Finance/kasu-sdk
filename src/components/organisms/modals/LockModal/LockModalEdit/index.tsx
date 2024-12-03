import { Stack } from '@mui/material'

import EstimatedBonusRewards from '@/components/organisms/modals/LockModal/LockModalEdit/EstimatedBonusRewards'
import LockModalBalanceOverview from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalBalanceOverview'
import LockModalDuration from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalDuration'
import LockModalEditActions from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalEditActions'
import LockModalInput from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalInput'

const LockModalEdit = () => {
  return (
    <Stack spacing={3}>
      <LockModalBalanceOverview />
      <LockModalInput />
      <LockModalDuration />
      <EstimatedBonusRewards />
      <LockModalEditActions />
    </Stack>
  )
}

export default LockModalEdit
