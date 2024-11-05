'use client'

import { Box, Divider, Stack, Typography } from '@mui/material'

import data from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/data.json'

const CollectionsPerformance = () => {
  return (
    <Box gap={5} display='flex' width='100%' maxWidth={520}>
      <Stack justifyContent='space-between' minWidth={200} width='100%'>
        <Box>
          <Typography variant='h5'>
            Collections Performance Bad & Doubtful Debts
          </Typography>
          <Divider sx={{ mt: 1.5 }} />
        </Box>
        <Box width='100%' height={237} position='relative' pt={2}>
          {/* <BarLineChart
            keys={['funded']}
            colors={['rgba(164, 123, 79, 1)']}
            data={data.collectionsPerformance.data}
            lines={[
              {
                xKey: 'x',
                yKey: 'invoicesLossed',
                color: data.creditRiskExposureStatus.legend[1].color,
              },
              {
                xKey: 'x',
                yKey: 'recoveryAction',
                color: data.creditRiskExposureStatus.legend[2].color,
              },
            ]}
            margin={{
              top: 10,
              right: 0,
              bottom: 36,
              left: 100,
            }}
            padding={0.6}
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
                      {formatAmount(data.funded)}
                    </Typography>
                  </Box>
                  <Box display='flex' alignItems='center'>
                    <Box
                      width={32}
                      height={2}
                      bgcolor='rgba(164, 123, 79, 1)'
                      borderRadius={1}
                      mr={1}
                    />
                    <Typography variant='baseSmBold'>
                      {formatAmount(data.invoicesLossed)}
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
                    <Typography variant='baseSmBold'>
                      {formatAmount(data.recoveryAction)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          /> */}
        </Box>
        <Stack spacing={1} pb={3} mt={3}>
          {data.collectionsPerformance.legend.map(({ color, label, type }) => (
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
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

export default CollectionsPerformance
