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
    <Card
      sx={(theme) => ({
        [theme.breakpoints.down('sm')]: {
          mt: 2,
        },
      })}
    >
      <CardHeader
        title={
          <Typography variant='h6' fontSize={isMobile ? 16 : undefined}>
            {t('details.riskManagement.title')}
          </Typography>
        }
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
            p: 1,
          },
        })}
      />

      <CardContent
        sx={(theme) => ({
          padding: 2,
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
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
              <Typography variant='subtitle1' p={{ xs: 0, sm: '4px' }} mt={3}>
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
                    titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
                    titleContainerSx={(theme) => ({
                      [theme.breakpoints.down('sm')]: {
                        px: 0,
                      },
                    })}
                    showDivider
                    metric={
                      <Typography
                        variant='body2'
                        pl={{ xs: 0, sm: 2 }}
                        mt={0.5}
                      >
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
