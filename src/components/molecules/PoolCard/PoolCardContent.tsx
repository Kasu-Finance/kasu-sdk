import { Box, Collapse, Typography } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { memo, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import { getPoolCardMetrics } from '@/components/molecules/PoolCard/pool.card.metrics'
import PoolCardMetricItem from '@/components/molecules/PoolCard/PoolCardMetricItem'

interface PoolCardContentProps {
  pool: PoolOverview
  poolDelegate: PoolDelegateProfileAndHistory
  hover: boolean
}

const PoolCardContent: React.FC<PoolCardContentProps> = ({
  pool,
  poolDelegate,
  hover,
}) => {
  const { t } = useTranslation()

  const { tranches, isMultiTranche } = useMemo(() => {
    return {
      tranches: pool?.tranches || [],
      isMultiTranche: pool?.tranches.length > 1,
    }
  }, [pool])

  const metrics = useMemo(
    () => getPoolCardMetrics(poolDelegate, pool),
    [poolDelegate, pool]
  )

  const collapsedMetrics = metrics.filter((metric) => metric.isCollapsed)
  const visibleMetrics = metrics.filter((metric) => !metric.isCollapsed)

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

      {visibleMetrics.map((metric) => (
        <PoolCardMetricItem key={metric.id} metric={metric} t={t} />
      ))}
      <Collapse in={hover}>
        {collapsedMetrics.map((metric) => (
          <PoolCardMetricItem key={metric.id} metric={metric} t={t} />
        ))}
      </Collapse>
    </Box>
  )
}

export default memo(PoolCardContent)
