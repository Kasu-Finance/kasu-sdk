import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CsvDownloadButton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedLendingRequestTransactions/CsvDownloadButton'
import PortfolioUserTransactionTableWrapper from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedLendingRequestTransactions/PortfolioUserTransactionTableWrapper'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

type DetailedLendingRequestTransactionProps = {
  currentEpoch: string
}

const DetailedLendingRequestTransactions: React.FC<
  DetailedLendingRequestTransactionProps
> = ({ currentEpoch }) => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t(
          'portfolio.transactions.detailedLendingRequestTransactions.title'
        )}
      >
        <CsvDownloadButton currentEpoch={currentEpoch} />
      </CustomCardHeader>
      <CustomInnerCardContent sx={{ p: 0 }}>
        <TransactionHistoryState withPoolIdFilter withPendingDecisions>
          <PortfolioUserTransactionTableWrapper currentEpoch={currentEpoch} />
        </TransactionHistoryState>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default DetailedLendingRequestTransactions
