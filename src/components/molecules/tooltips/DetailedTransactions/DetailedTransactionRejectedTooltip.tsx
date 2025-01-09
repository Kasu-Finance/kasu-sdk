import getTranslation from '@/hooks/useTranslation'

const DetailedTransactionRejectedTooltip = () => {
  const { t } = getTranslation()

  return (
    <>
      {t(
        'portfolio.transactions.detailedLendingRequestTransactions.tooltips.deposit.rejected.tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.detailedLendingRequestTransactions.tooltips.deposit.rejected.tooltip-2'
      )}
    </>
  )
}

export default DetailedTransactionRejectedTooltip
