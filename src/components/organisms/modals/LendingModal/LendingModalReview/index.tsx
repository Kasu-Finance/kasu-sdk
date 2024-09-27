import { Stack } from '@mui/material'

import AcknowledgementMessage from '@/components/organisms/modals/LendingModal/LendingModalReview/AcknowledgmentMessage'
import LendingModalReviewActions from '@/components/organisms/modals/LendingModal/LendingModalReview/LendingModalReviewActions'
import LendingModalReviewOverview from '@/components/organisms/modals/LendingModal/LendingModalReview/LendingModalReviewOverview'
import NextClearingPeriodInfo from '@/components/organisms/modals/LendingModal/LendingModalReview/NextClearingPeriodInfo'

const LendingModalReview = () => {
  return (
    <Stack spacing={3} mt={3}>
      <LendingModalReviewOverview />
      <AcknowledgementMessage />
      <NextClearingPeriodInfo />
      <LendingModalReviewActions />
    </Stack>
  )
}

export default LendingModalReview
