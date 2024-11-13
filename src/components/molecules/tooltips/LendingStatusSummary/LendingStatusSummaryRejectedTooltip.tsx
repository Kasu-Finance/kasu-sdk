import getTranslation from '@/hooks/useTranslation'

const LendingStatusSummaryRejectedTooltip = () => {
  const { t } = getTranslation()

  return (
    <>
      {t(
        'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-3-tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-3-tooltip-2'
      )}
    </>
  )
}

export default LendingStatusSummaryRejectedTooltip
