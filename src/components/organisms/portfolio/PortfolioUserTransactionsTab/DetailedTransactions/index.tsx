import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CsvDownloadButton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/CsvDownloadButton'
import PortfolioUserTransactionTableWrapper from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionTableWrapper'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

const DetailedTransactions = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('portfolio.transactions.detailedTransactions.title')}
      >
        <CsvDownloadButton />
      </CustomCardHeader>
      <CustomInnerCardContent sx={{ p: 0 }}>
        <TransactionHistoryState withPoolIdFilter withPendingDecisions>
          <PortfolioUserTransactionTableWrapper />
        </TransactionHistoryState>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default DetailedTransactions
