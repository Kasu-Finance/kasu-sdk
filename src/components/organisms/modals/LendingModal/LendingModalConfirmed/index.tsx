import { Stack } from '@mui/material'

import LendingInfo from '@/components/organisms/modals/LendingModal/LendingModalConfirmed/LendingInfo'
import LendingModalConfirmedActions from '@/components/organisms/modals/LendingModal/LendingModalConfirmed/LendingModalConfirmedActions'
import WhatsNext from '@/components/organisms/modals/LendingModal/LendingModalConfirmed/WhatsNext'

const LendingModalConfirmed = () => {
  return (
    <Stack spacing={3} mt={3}>
      <LendingInfo />
      <WhatsNext />
      <LendingModalConfirmedActions />
    </Stack>
  )
}

export default LendingModalConfirmed
