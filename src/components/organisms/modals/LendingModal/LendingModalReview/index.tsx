import { Stack } from '@mui/material'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import getTranslation from '@/hooks/useTranslation'

import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'
import AcknowledgementMessage from '@/components/organisms/modals/LendingModal/LendingModalReview/AcknowledgmentMessage'
import LendingModalReviewActions from '@/components/organisms/modals/LendingModal/LendingModalReview/LendingModalReviewActions'
import LendingModalReviewOverview from '@/components/organisms/modals/LendingModal/LendingModalReview/LendingModalReviewOverview'

const LendingModalReview = () => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  return (
    <Stack spacing={3} mt={3}>
      <LendingModalReviewOverview />
      {!isLiteMode && (
        <>
          <AcknowledgementMessage />
          <NextClearingPeriodInfo
            beforeText={t('modals.lending.review.nextClearingText')}
          />
        </>
      )}
      <LendingModalReviewActions />
    </Stack>
  )
}

export default LendingModalReview
