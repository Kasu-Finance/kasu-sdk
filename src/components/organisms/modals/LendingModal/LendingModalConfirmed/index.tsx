import { Stack } from '@mui/material'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import LendingInfo from '@/components/organisms/modals/LendingModal/LendingModalConfirmed/LendingInfo'
import LendingModalConfirmedActions from '@/components/organisms/modals/LendingModal/LendingModalConfirmed/LendingModalConfirmedActions'
import ShareReferralCta from '@/components/organisms/modals/LendingModal/LendingModalConfirmed/ShareReferralCta'
import WhatsNext from '@/components/organisms/modals/LendingModal/LendingModalConfirmed/WhatsNext'

const LendingModalConfirmed = () => {
  const { isLiteMode } = useLiteModeState()

  return (
    <Stack spacing={3} mt={3}>
      <LendingInfo />
      <ShareReferralCta />
      {!isLiteMode && <WhatsNext />}
      <LendingModalConfirmedActions />
    </Stack>
  )
}

export default LendingModalConfirmed
