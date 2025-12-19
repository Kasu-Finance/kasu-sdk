import getTranslation from '@/hooks/useTranslation'

import ApiCsvDownloadButton from '@/components/atoms/ApiCsvDownloadButton'
import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import PortfolioUserTransactionTableWrapper from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedLendingRequestTransactions/PortfolioUserTransactionTableWrapper'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

import { DownloadRoundedIcon } from '@/assets/icons'

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
        <ApiCsvDownloadButton
          kind='transactions-lending-requests'
          epochId={currentEpoch}
          variant='text'
          sx={{
            maxWidth: 368,
            ml: 'auto',
            textTransform: 'capitalize',
            height: 'auto',
          }}
          endIcon={<DownloadRoundedIcon />}
        >
          {t('general.csvDownload')}
        </ApiCsvDownloadButton>
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
