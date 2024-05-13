import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import { RiskManagement } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import RiskStatus from '@/components/molecules/details/RiskManagementCard/RiskStatus'

import { convertToRiskStatus } from '@/utils'

interface RiskManagementCardProps {
  data: RiskManagement
}

const RiskManagementCard: React.FC<RiskManagementCardProps> = ({ data }) => {
  const { t } = useTranslation()

  const { riskStatus } = useMemo(
    () => convertToRiskStatus(data.riskPerformance),
    [data]
  )

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

        {/* Dynamic sections as items */}
        <Box display='flex'>
          {data.items.map((item, index) => (
            <Box
              key={item.id}
              display='flex'
              width='100%'
              flexDirection='column'
              sx={{
                pr: index % 2 === 0 ? 2 : 0,
              }}
            >
              <Typography variant='subtitle1' sx={{ mt: 3 }}>
                {item.group}
              </Typography>

              <InfoColumn
                title={item.title}
                toolTipInfo={item.tooltip}
                showDivider
                metric={
                  <Typography variant='body2' sx={{ pl: 2, mt: 0.5 }}>
                    {item.title}
                  </Typography>
                }
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default RiskManagementCard
