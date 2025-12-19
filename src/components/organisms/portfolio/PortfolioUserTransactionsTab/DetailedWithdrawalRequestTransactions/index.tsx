import getTranslation from '@/hooks/useTranslation'

import ApiCsvDownloadButton from '@/components/atoms/ApiCsvDownloadButton'
import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import WithdrawalTransactionsTableWrapper from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions/WithdrawalTransactionsTableWrapper'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

import { DownloadRoundedIcon } from '@/assets/icons'

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
        <ApiCsvDownloadButton
          kind='transactions-withdrawal-requests'
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
        <TransactionHistoryState withPoolIdFilter>
          <WithdrawalTransactionsTableWrapper currentEpoch={currentEpoch} />
        </TransactionHistoryState>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default DetailedWithdrawalRequestTransactions
