import { Box, Collapse, Typography } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { memo, useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
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

  const currentDevice = useDeviceDetection()

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
    <Box px={{ sm: 2, xs: 1 }} mb={{ sm: 3, xs: 1 }}>
      <ColoredBox
        display='flex'
        justifyContent='center'
        alignItems='flex-start'
        gap={1}
        mt={{ sm: 3, xs: 1 }}
        px={{ xs: 1.5, md: 0 }}
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
              alignTitleItems='flex-end'
              subtitle={
                isMultiTranche
                  ? t('lending.poolOverview.investmentCard.trancheApy.label')
                  : ' '
              }
              toolTipInfo={tooltipKey}
              showDivider
              metric={
                <Typography variant='subtitle2' pl={{ md: 2 }} mt={0.5}>
                  {formattedApy}
                </Typography>
              }
              titleStyle={
                !isMultiTranche
                  ? {
                      display: 'block',
                      mt: '20px',
                      fontSize:
                        currentDevice === Device.MOBILE ? 12 : undefined,
                    }
                  : undefined
              }
              titleContainerSx={(theme) => ({
                [theme.breakpoints.down('md')]: {
                  px: 0,
                },
              })}
              containerSx={{
                width: isMultiTranche ? '50%' : '100%',
                pb: 1,
              }}
              subtitleStyle={{
                component: 'p',
                sx: { ml: 0 },
                variant: 'caption',
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
