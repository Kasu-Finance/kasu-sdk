import { Box, Typography } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import InfoRow from '@/components/atoms/InfoRow'

import { PoolDelegateMetricIds } from '@/constants'
import { formatAmount } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'

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
        value: formatAmount(poolDelegate?.totalLoanFundsOriginated || '0', {
          minValue: 1_000_000,
        }),
        suffix: ' USDC',
        sx: {
          mt: 2,
          pb: 0,
          borderBottomLeftRadius: '0',
          borderBottomRightRadius: '0',
        },
        showDivider: true,
      },
      {
        id: PoolDelegateMetricIds.TotalLossRate,
        title: 'lending.poolOverview.detailCard.totalLossRate',
        value: `${formatAmount(+poolDelegate.historicLossRate || '0')}  %`,
        suffix: '',
        showDivider: false,
        sx: {
          pt: 0,
          borderTopLeftRadius: '0',
          borderTopRightRadius: '0',
        },
      },
      {
        id: PoolDelegateMetricIds.AssetClasses,
        title: 'details.poolDetails.assetClass',
        value: poolDelegate?.assetClasses || 'N/A',
        suffix: '',
        sx: {
          mt: 1,
        },
        showDivider: false,
      },
      {
        id: PoolDelegateMetricIds.Security,
        title: 'lending.poolOverview.detailCard.security',
        value: 'N/A',
        suffix: '',
        sx: {
          mt: 1,
          maxHeight: 0,
          transition: 'max-height 0.3s ease',
          padding: 0,
          overflow: 'hidden',
        },
        showDivider: false,
      },
      {
        id: PoolDelegateMetricIds.LendingHistory,
        title: 'lending.poolOverview.detailCard.lendingHistory',
        value: poolDelegate.delegateLendingHistory
          ? String(
              formatDuration(poolDelegate.delegateLendingHistory, {
                months: true,
                days: true,
              })
            )
          : 'N/A',
        suffix: '',
        sx: {
          mt: 1,
          maxHeight: 0,
          transition: 'max-height 0.3s ease',
          padding: 0,
          overflow: 'hidden',
        },
        showDivider: false,
      },
    ]

    return baseMetrics
  }, [poolDelegate])

  return (
    <Box pl={2} pr={2} mb={3}>
      <ColoredBox
        display='flex'
        justifyContent='center'
        alignItems='flex-start'
        mt={3}
      >
        {tranches.map((tranche) => {
          const titleKey = isMultiTranche
            ? `lending.shortcutTranche.${tranche.name.toLowerCase()}.title`
            : 'lending.poolOverview.investmentCard.loanApy'

          const tooltipKey = isMultiTranche
            ? ''
            : t('lending.poolOverview.investmentCard.tooltip')
          const trancheApy = parseFloat(tranche.apy) * 100
          const formattedApy = trancheApy.toFixed(2) + ' %'

          return (
            <InfoColumn
              key={tranche.id}
              title={t(titleKey)}
              alignTitleItems='normal'
              subtitle={
                isMultiTranche
                  ? t('lending.poolOverview.investmentCard.trancheApy.label')
                  : ' '
              }
              toolTipInfo={tooltipKey}
              showDivider
              metric={
                <Typography variant='subtitle2' sx={{ pl: 2, mt: 0.5 }}>
                  {formattedApy}
                </Typography>
              }
              containerSx={{
                width: isMultiTranche ? '50%' : '100%',
                pb: 1,
              }}
              subtitleStyle={{
                component: 'p',
                sx: { ml: 0 },
                variant: 'caption',
                minHeight: '20px',
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
          className={metric.id}
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
                <Typography variant='subtitle2' maxWidth={160}>
                  {metric.value}
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
