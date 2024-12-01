import getTranslation from '@/hooks/useTranslation'

const WithdrawalStatusSummaryAcceptedTooltip = () => {
  const { t } = getTranslation()

  return (
    <>
      {t(
        'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-3-tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-3-tooltip-2'
      )}
    </>
  )
}

export default WithdrawalStatusSummaryAcceptedTooltip
