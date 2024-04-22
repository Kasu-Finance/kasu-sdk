import { Box } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

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
    return [
      {
        id: 'details.poolDetails.assetClass',
        value: poolDelegate?.assetClasses || 'N/A',
        suffix: '',
      },
      {
        id: 'details.poolDelegate.loss',
        value: poolDelegate?.historicLossRate || '0.00',
        suffix: '%',
      },
      {
        id: 'details.poolDelegate.totalLoans',
        value: poolDelegate?.totalLoansOriginated || '0.00',
        suffix: 'USDC',
      },
      {
        id: 'details.poolDelegate.totalFunds',
        value: poolDelegate?.totalLoanFundsOriginated || '0.00',
        suffix: 'USDC',
      },
    ]
  }, [poolDelegate])

  return (
    <>
      <Box display='flex' justifyContent='center' mt={3}>
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
      </Box>

      <Box display='flex' flexDirection='column' mt={3}>
        {metrics.map((metric) => (
          <MetricWithSuffix
            key={metric.id}
            content={String(metric.value)}
            suffix={metric.suffix}
            titleKey={t(`${metric.id}.label`)}
            tooltipKey={t(`${metric.id}.tooltip`)}
            containerSx={{
              width: '100%',
              pb: 1,
            }}
          />
        ))}
      </Box>
    </>
  )
}

export default PoolCardContent
