import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import {
  RiskManagement,
  RiskManagementItem,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import RiskStatus from '@/components/molecules/details/RiskManagementCard/RiskStatus'

import { convertToRiskStatus } from '@/utils'

interface RiskManagementCardProps {
  data: RiskManagement
}

const RiskManagementCard: React.FC<RiskManagementCardProps> = ({ data }) => {
  const { t } = useTranslation()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const { riskStatus } = useMemo(
    () => convertToRiskStatus(data.riskPerformance),
    [data]
  )

  const securityStructureItems = useMemo(() => {
    return data.items.reduce<Record<string, RiskManagementItem[]>>(
      (acc, item) => {
        acc[item.group] = acc[item.group] || []
        acc[item.group].push(item)
        return acc
      },
      {}
    )
  }, [data.items])

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant='h6'>
            {t('details.riskManagement.title')}
          </Typography>
        }
      />

      <CardContent sx={{ padding: 2 }}>
        <RiskStatus metrics={riskStatus.metrics} />
        <Box
          display='flex'
          flexDirection={isMobile ? 'column' : 'row'}
          width='100%'
        >
          {/* Render groups and items within each group */}
          {Object.entries(securityStructureItems).map(([group, items]) => (
            <Box
              key={group}
              display='flex'
              flexDirection='column'
              width={isMobile ? '100%' : '50%'}
            >
              <Typography variant='subtitle1' sx={{ mt: 3, padding: '4px' }}>
                {group}
              </Typography>
              {items.map((item) => (
                <Box
                  key={item.id}
                  display='flex'
                  width='100%'
                  flexDirection='column'
                  sx={{ pr: 2, py: 0.5 }}
                >
                  <InfoColumn
                    title={item.title}
                    toolTipInfo={item.tooltip}
                    showDivider
                    metric={
                      <Typography variant='body2' sx={{ pl: 2, mt: 0.5 }}>
                        {item.description}
                      </Typography>
                    }
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default RiskManagementCard
