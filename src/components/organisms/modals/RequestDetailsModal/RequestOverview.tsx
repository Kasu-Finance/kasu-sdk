import { Box, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import VariableAndFixedApyTooltip from '@/components/molecules/tooltips/VariableAndFixedApyTooltip'

import { formatPercentage, formatTimestamp, TimeConversions } from '@/utils'
import {
  DetailedTransactionReallocationRequest,
  DetailedTransactionWrapper,
} from '@/utils/lending/getDetailedTransactions'
import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

type RequestOverviewProps = {
  transaction:
    | WithdrawalTransactionWrapper
    | DetailedTransactionWrapper
    | DetailedTransactionReallocationRequest
}

const RequestOverview: React.FC<RequestOverviewProps> = ({ transaction }) => {
  const { t } = getTranslation()

  const isReallocation = 'id' in transaction

  const isFixedTermDeposit = Boolean(transaction.fixedTermConfig)

  const initialDeposit = !isReallocation
    ? transaction.transactions[0]
    : undefined

  const formattedTime =
    isFixedTermDeposit && initialDeposit
      ? formatTimestamp(
          initialDeposit.requestTimestamp +
            parseFloat(
              initialDeposit.fixedTermConfig?.epochLockDuration ?? '0'
            ) *
              TimeConversions.SECONDS_PER_WEEK,
          {
            format: 'DD.MM.YYYY HH:mm:ss',
            includeUtcOffset: true,
          }
        )
      : undefined

  return (
    <Box>
      <InfoRow
        title={t(
          isFixedTermDeposit ? 'general.fixedApy' : 'general.variableApy'
        )}
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title={<VariableAndFixedApyTooltip />}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        titleStyle={{
          variant: 'baseMdBold',
        }}
        metric={
          <Typography variant='h4'>
            {formatPercentage(
              isFixedTermDeposit
                ? transaction.fixedTermConfig!.apy
                : isReallocation
                  ? transaction.apy
                  : initialDeposit?.apy ?? 0
            )}
          </Typography>
        }
      />
      <InfoRow
        title={t('general.tranche')}
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title='info'
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMd'>{transaction.trancheName}</Typography>
        }
      />
      {formattedTime && (
        <InfoRow
          title='Fixed Loan Term Expiry'
          showDivider
          dividerProps={{ color: 'white' }}
          toolTipInfo={
            <ToolTip
              title='info'
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': {
                  color: 'rgba(133, 87, 38, 1)',
                },
              }}
            />
          }
          metric={
            <Typography variant='baseMd'>{formattedTime.date}</Typography>
          }
        />
      )}
    </Box>
  )
}

export default RequestOverview
