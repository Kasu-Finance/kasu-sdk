import getTranslation from '@/hooks/useTranslation'

const LendingStatusSummaryRequestedTooltip = () => {
  const { t } = getTranslation()

  return (
    <>
      {t(
        'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-1-tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-1-tooltip-2'
      )}
    </>
  )
}

export default LendingStatusSummaryRequestedTooltip
