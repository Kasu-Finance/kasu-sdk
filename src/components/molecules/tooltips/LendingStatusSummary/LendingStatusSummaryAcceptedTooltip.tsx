import getTranslation from '@/hooks/useTranslation'

const LendingStatusSummaryAcceptedTooltip = () => {
  const { t } = getTranslation()

  return (
    <>
      {t(
        'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-2-tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-2-tooltip-2'
      )}
    </>
  )
}

export default LendingStatusSummaryAcceptedTooltip
