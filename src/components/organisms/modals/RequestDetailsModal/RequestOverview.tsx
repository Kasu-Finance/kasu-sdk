import { Box, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import VariableAndFixedApyTooltip from '@/components/molecules/tooltips/VariableAndFixedApyTooltip'

import { formatAmount, formatPercentage, formatTimestamp } from '@/utils'
import {
  DetailedTransaction,
  DetailedTransactionReallocationRequest,
} from '@/utils/lending/getDetailedTransactions'

type RequestOverviewProps = {
  transaction: DetailedTransaction | DetailedTransactionReallocationRequest
  isCancellable: boolean
}

const RequestOverview: React.FC<RequestOverviewProps> = ({
  transaction,
  isCancellable,
}) => {
  const { t } = getTranslation()

  const formattedTime = formatTimestamp(transaction.timestamp, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box>
      <InfoRow
        title={t(
          transaction.fixedTermConfig
            ? 'general.fixedApy'
            : 'general.variableApy'
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
        metric={
          <Typography variant='h4'>
            {formatPercentage(
              transaction.fixedTermConfig
                ? transaction.fixedTermConfig.apy
                : transaction.apy
            )}
          </Typography>
        }
      />
      <InfoRow
        title={t('modals.requestDetails.metric-1')}
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.requestDetails.metric-1-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formattedTime.date}{' '}
            <Typography
              variant='inherit'
              color='gold.extraDark'
              display='inline'
            >
              {formattedTime.timestamp} {formattedTime.utcOffset}
            </Typography>
          </Typography>
        }
      />

      {(transaction.requestType === 'Deposit' ||
        transaction.requestType === 'Withdrawal') && (
        <>
          <InfoRow
            title={t('modals.requestDetails.metric-2')}
            showDivider
            dividerProps={{ color: 'white' }}
            toolTipInfo={
              <ToolTip
                title={t('modals.requestDetails.metric-2-tooltip')}
                iconSx={{
                  color: 'gold.extraDark',
                  '&:hover': {
                    color: 'rgba(133, 87, 38, 1)',
                  },
                }}
              />
            }
            metric={
              <Typography variant='baseMdBold'>
                {formatAmount(transaction.requestedAmount, { minDecimals: 2 })}{' '}
                USDC
              </Typography>
            }
          />
          {!isCancellable && (
            <InfoRow
              title={t('modals.requestDetails.metric-6')}
              showDivider
              dividerProps={{ color: 'white' }}
              toolTipInfo={
                <ToolTip
                  title={t('modals.requestDetails.metric-6-tooltip')}
                  iconSx={{
                    color: 'gold.extraDark',
                    '&:hover': {
                      color: 'rgba(133, 87, 38, 1)',
                    },
                  }}
                />
              }
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(transaction.acceptedAmount, { minDecimals: 2 })}{' '}
                  USDC
                </Typography>
              }
            />
          )}
        </>
      )}
      {transaction.requestType === 'Reallocation' && (
        <InfoRow
          title={t('modals.requestDetails.metric-7')}
          showDivider
          dividerProps={{ color: 'white' }}
          toolTipInfo={
            <ToolTip
              title={t('modals.requestDetails.metric-7-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': {
                  color: 'rgba(133, 87, 38, 1)',
                },
              }}
            />
          }
          metric={
            <Typography variant='baseMdBold'>
              {formatAmount(transaction.reallocatedInAmount, {
                minDecimals: 2,
              })}{' '}
              USDC
            </Typography>
          }
        />
      )}
      {!isCancellable && (
        <>
          {transaction.requestType === 'Deposit' && (
            <>
              <InfoRow
                title={t('modals.requestDetails.metric-4')}
                showDivider
                dividerProps={{ color: 'white' }}
                toolTipInfo={
                  <ToolTip
                    title={t('modals.requestDetails.metric-4-tooltip')}
                    iconSx={{
                      color: 'gold.extraDark',
                      '&:hover': {
                        color: 'rgba(133, 87, 38, 1)',
                      },
                    }}
                  />
                }
                metric={
                  <Typography variant='baseMdBold'>
                    {formatAmount(transaction.rejectedAmount, {
                      minDecimals: 2,
                    })}{' '}
                    USDC
                  </Typography>
                }
              />
              <InfoRow
                title={t('modals.requestDetails.metric-5')}
                showDivider
                dividerProps={{ color: 'white' }}
                toolTipInfo={
                  <ToolTip
                    title={t('modals.requestDetails.metric-5-tooltip')}
                    iconSx={{
                      color: 'gold.extraDark',
                      '&:hover': {
                        color: 'rgba(133, 87, 38, 1)',
                      },
                    }}
                  />
                }
                metric={
                  <Typography variant='baseMdBold'>
                    {formatAmount(transaction.reallocatedOutAmount, {
                      minDecimals: 2,
                    })}{' '}
                    USDC
                  </Typography>
                }
              />
            </>
          )}
          {transaction.requestType === 'Withdrawal' && (
            <InfoRow
              title={t('modals.requestDetails.metric-3')}
              showDivider
              dividerProps={{ color: 'white' }}
              toolTipInfo={
                <ToolTip
                  title={t('modals.requestDetails.metric-3-tooltip')}
                  iconSx={{
                    color: 'gold.extraDark',
                    '&:hover': {
                      color: 'rgba(133, 87, 38, 1)',
                    },
                  }}
                />
              }
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(transaction.queuedAmount, { minDecimals: 2 })}{' '}
                  USDC
                </Typography>
              }
            />
          )}
        </>
      )}
    </Box>
  )
}

export default RequestOverview
