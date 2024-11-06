'use client'

import { Box, Divider, Paper, Stack, Typography } from '@mui/material'

import BarLineChart from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/BarLineChart'
import data from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/data.json'

import { formatAmount } from '@/utils'

const CreditRiskExposureStatus = () => {
  return (
    <Box gap={5} display='flex' width='100%' maxWidth={520}>
      <Stack justifyContent='space-between' minWidth={200} width='100%'>
        <Box>
          <Typography variant='h5'>Credit Risk Exposure Status</Typography>
          <Divider sx={{ mt: 1.5 }} />
        </Box>
        <Box width='100%' height={237} position='relative' pt={2}>
          <BarLineChart
            keys={['outstanding', 'funded']}
            colors={['rgba(232, 192, 145, 1)', 'rgba(164, 123, 79, 1)']}
            data={data.creditRiskExposureStatus.data}
            lines={[
              {
                xKey: 'x',
                yKey: 'y',
                showAxis: true,
                color: data.creditRiskExposureStatus.legend[2].color,
                customScale: true,
              },
            ]}
            margin={{
              top: 10,
              right: 36,
              bottom: 36,
              left: 100,
            }}
            padding={0.3}
            renderTooltip={(data) => (
              <Paper sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                <Stack spacing={1}>
                  <Box display='flex' alignItems='center'>
                    <Box
                      width={32}
                      height={16}
                      bgcolor='rgba(232, 192, 145, 1)'
                      borderRadius={1}
                      mr={1}
                    />
                    <Typography variant='baseSmBold'>
                      {formatAmount(data.outstanding)}
                    </Typography>
                  </Box>
                  <Box display='flex' alignItems='center'>
                    <Box
                      width={32}
                      height={16}
                      bgcolor='rgba(164, 123, 79, 1)'
                      borderRadius={1}
                      mr={1}
                    />
                    <Typography variant='baseSmBold'>
                      {formatAmount(data.funded)}
                    </Typography>
                  </Box>
                  <Box display='flex' alignItems='center'>
                    <Box
                      width={32}
                      height={2}
                      bgcolor='rgba(40, 40, 42, 1)'
                      borderRadius={1}
                      mr={1}
                    />
                    <Typography variant='baseSmBold'>{data.y}%</Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          />
        </Box>
        <Stack spacing={1} pb={3} mt={3}>
          {data.creditRiskExposureStatus.legend.map(
            ({ color, label, type }) => (
              <Box key={label} display='flex' alignItems='center'>
                <Box
                  width={32}
                  height={type === 'bar' ? 16 : 2}
                  bgcolor={color}
                  borderRadius={1}
                  mr={1}
                />
                <Typography variant='baseMd'>{label}</Typography>
              </Box>
            )
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

export default CreditRiskExposureStatus
