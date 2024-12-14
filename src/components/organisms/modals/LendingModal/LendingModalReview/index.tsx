import { Stack } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'
import AcknowledgementMessage from '@/components/organisms/modals/LendingModal/LendingModalReview/AcknowledgmentMessage'
import LendingModalReviewActions from '@/components/organisms/modals/LendingModal/LendingModalReview/LendingModalReviewActions'
import LendingModalReviewOverview from '@/components/organisms/modals/LendingModal/LendingModalReview/LendingModalReviewOverview'

const LendingModalReview = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3} mt={3}>
      <LendingModalReviewOverview />
      <AcknowledgementMessage />
      <NextClearingPeriodInfo
        beforeText={t('modals.lending.nextClearingText')}
      />
      <LendingModalReviewActions />
    </Stack>
  )
}

export default LendingModalReview
