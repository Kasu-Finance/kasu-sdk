import { Box, Typography } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { PoolDelegateMetricIds } from '@/constants'
import { formatAmount } from '@/utils'

interface PoolCardContentProps {
  pool: PoolOverview
  poolDelegate: PoolDelegateProfileAndHistory
}

const PoolCardContent: React.FC<PoolCardContentProps> = ({
  pool,
  poolDelegate,
}) => {
  const { t } = useTranslation()
  const { tranches, isMultiTranche } = useMemo(() => {
    return {
      tranches: pool?.tranches || [],
      isMultiTranche: pool?.tranches.length > 1,
    }
  }, [pool])

  const metrics = useMemo(() => {
    const baseMetrics = [
      {
        id: PoolDelegateMetricIds.TotalFunds,
        title: 'details.poolDelegate.totalFunds',
        value: poolDelegate?.totalLoanFundsOriginated.toFixed(2) || '0.00',
        suffix: 'USDC',
        sx: { mt: 2 },
        showDivider: true,
      },
      {
        id: PoolDelegateMetricIds.TotalLossRate,
        title: 'lending.poolOverview.detailCard.totalLossRate',
        value: formatAmount(+poolDelegate.historicLossRate) || '0',
        suffix: '%',
        showDivider: false,
        sx: { pt: 0 },
      },
      {
        id: PoolDelegateMetricIds.AssetClasses,
        title: 'details.poolDelegate.assetClass',
        value: poolDelegate?.assetClasses || 'N/A',
        suffix: '',
        sx: { mt: 1 },
        showDivider: false,
      },
    ]
    if (poolDelegate?.delegateLendingHistory) {
      baseMetrics.push({
        id: PoolDelegateMetricIds.LendingHistory,
        title: 'lending.poolOverview.detailCard.lendingHistory',
        value: String(poolDelegate.delegateLendingHistory),
        suffix: 'days', // TODO: check if this is correct
        sx: { mt: 1 },
        showDivider: false,
      })
    }
    // TODO: adjust condition when security metric is available
    if (poolDelegate.id === 'securityMetric') {
      baseMetrics.push({
        id: PoolDelegateMetricIds.Security,
        title: '',
        value: '',
        suffix: '',
        sx: { mt: 1 },
        showDivider: true,
      })
    }

    return baseMetrics
  }, [poolDelegate])

  return (
    <Box pl={2} pr={2}>
      <ColoredBox display='flex' justifyContent='center' mt={3}>
        {tranches.map((tranche) => {
          const titleKey = isMultiTranche
            ? `lending.shortcutTranche.${tranche.name.toLowerCase()}.title`
            : 'general.poolApy'
          const trancheApy = parseFloat(tranche.apy) * 100
          const formattedApy = trancheApy.toFixed(2)

          return (
            // TODO: use here <InfoColumn key={tranche.id} title={title} subtitle={} metric={tranche.apy} />
            <MetricWithSuffix
              key={tranche.id}
              content={formattedApy}
              suffix='%'
              titleKey={titleKey}
              tooltipKey=''
              containerSx={{
                width: isMultiTranche ? '50%' : '100%',
                pb: 1,
              }}
            />
          )
        })}
      </ColoredBox>

      {metrics.map((metric) => (
        <ColoredBox
          key={metric.id}
          display='flex'
          flexDirection='column'
          sx={{
            width: '100%',
            ...metric.sx,
          }}
        >
          <InfoRow
            key={metric.id}
            title={t(`${metric.title}.label`)}
            toolTipInfo={t(`${metric.title}.tooltip`)}
            showDivider={metric.showDivider}
            metric={
              <>
                <Typography variant='subtitle2'>
                  {metric.value}{' '}
                  <Typography variant='caption' component='span'>
                    {metric.suffix || ''}
                  </Typography>
                </Typography>
              </>
            }
          />
        </ColoredBox>
      ))}
    </Box>
  )
}

export default PoolCardContent
