import getTranslation from '@/hooks/useTranslation'

const WithdrawalStatusSummaryCancelledTooltip = () => {
  const { t } = getTranslation()

  return (
    <>
      {t(
        'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-4-tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-4-tooltip-2'
      )}{' '}
    </>
  )
}

export default WithdrawalStatusSummaryCancelledTooltip
