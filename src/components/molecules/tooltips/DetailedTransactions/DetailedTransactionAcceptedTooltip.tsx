import getTranslation from '@/hooks/useTranslation'

import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'

type DetailedTransactionAcceptedTooltipProps = {
  requestType: Omit<DetailedTransaction['requestType'], 'reallocation'>
}

const DetailedTransactionAcceptedTooltip: React.FC<
  DetailedTransactionAcceptedTooltipProps
> = ({ requestType }) => {
  const { t } = getTranslation()

  return requestType === 'Deposit' ? (
    <>
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.deposit.accepted.tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.deposit.accepted.tooltip-2'
      )}
    </>
  ) : (
    <>
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.withdrawal.accepted.tooltip-1'
      )}
      <br />
      <br />
      {t(
        'portfolio.transactions.detailedTransactions.tooltips.withdrawal.accepted.tooltip-2'
      )}
    </>
  )
}

export default DetailedTransactionAcceptedTooltip
