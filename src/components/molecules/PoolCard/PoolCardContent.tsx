import { Box } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

interface PoolCardContentProps {
  pool: PoolOverview
}

const PoolCardContent: React.FC<PoolCardContentProps> = ({ pool }) => {
  const { tranches, isMultiTranche } = useMemo(() => {
    return {
      tranches: pool?.tranches || [],
      isMultiTranche: pool?.tranches.length > 1,
      poolApy: pool?.apy || '0.00',
    }
  }, [pool])

  return (
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
  )
}

export default PoolCardContent
