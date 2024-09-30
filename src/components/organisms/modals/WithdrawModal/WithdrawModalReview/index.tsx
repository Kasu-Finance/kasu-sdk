import { Stack } from '@mui/material'

import WithdrawalScheduleInfo from '@/components/organisms/modals/WithdrawModal/WithdrawModalReview/WithdrawalScheduleInfo'
import WithdrawModalReviewOverview from '@/components/organisms/modals/WithdrawModal/WithdrawModalReview/WithdrawlModalReviewOverview'
import WithdrawModalReviewActions from '@/components/organisms/modals/WithdrawModal/WithdrawModalReview/WithdrawModalReviewActions'

const WithdrawModalReview = () => {
  return (
    <Stack spacing={3} mt={3}>
      <WithdrawModalReviewOverview />
      <WithdrawalScheduleInfo />
      <WithdrawModalReviewActions />
    </Stack>
  )
}

export default WithdrawModalReview
