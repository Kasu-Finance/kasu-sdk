import getTranslation from '@/hooks/useTranslation'

const LendingStatusSummaryCancelledTooltip = () => {
  const { t } = getTranslation()

  return (
    <>
      {t(
        'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-5-tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-5-tooltip-2'
      )}{' '}
    </>
  )
}

export default LendingStatusSummaryCancelledTooltip
