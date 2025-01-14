import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CsvDownloadButton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions/CsvDownloadButton'
import WithdrawalTransactionsTableWrapper from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions/WithdrawalTransactionsTableWrapper'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

type DetailedWithdrawalRequestTransactionProps = {
  currentEpoch: string
}

const DetailedWithdrawalRequestTransactions: React.FC<
  DetailedWithdrawalRequestTransactionProps
> = ({ currentEpoch }) => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t(
          'portfolio.transactions.detailedWithdrawalRequestTransaction.title'
        )}
      >
        <CsvDownloadButton currentEpoch={currentEpoch} />
      </CustomCardHeader>
      <CustomInnerCardContent sx={{ p: 0 }}>
        <TransactionHistoryState withPoolIdFilter>
          <WithdrawalTransactionsTableWrapper currentEpoch={currentEpoch} />
        </TransactionHistoryState>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default DetailedWithdrawalRequestTransactions
