import { Box, Card, Grid } from '@mui/material'

import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

const OverviewDetails = () => {
  return (
    <Box sx={{ mt: 3 }}>
      <Grid
        container
        direction='row'
        justifyContent='flex-start'
        alignItems='stretch'
        columnSpacing={3}
        sx={{ height: '248px' }}
      >
        <Grid item xs={6} sx={{ height: '100%' }} alignItems='stretch'>
          <Card sx={{ p: 2, height: '100%' }}>
            <Grid container columnSpacing={2} sx={{ pb: 3 }}>
              <Grid item xs={6}>
                <MetricWithSuffix
                  content='10.2 M'
                  suffix='USDC'
                  tooltipKey='01'
                  titleKey='Total Value Locked (TVL)'
                />
              </Grid>
              <Grid item xs={6}>
                <MetricWithSuffix
                  content='10.2 M'
                  suffix='USDC'
                  tooltipKey='01'
                  titleKey='Total Value Locked (TVL)'
                />
              </Grid>
            </Grid>
            <Box className='light-blue-background' sx={{ mt: 1 }}>
              <Grid
                container
                justifyContent='space-between'
                columnSpacing={2}
                sx={{ pb: 5.1 }}
              >
                <Grid item xs={6}>
                  <MetricWithSuffix
                    content='10,000.00 M'
                    suffix='USDC'
                    tooltipKey='03'
                    titleKey='Total Pool Yield Earned'
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricWithSuffix
                    content='500.00'
                    suffix='USDC'
                    tooltipKey='04'
                    titleKey='Total Loss Rate'
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sx={{ height: '100%' }} alignItems='stretch'>
          <Card sx={{ p: 2, height: '100%' }}>
            <Grid container columnSpacing={2} sx={{ pb: 3 }}>
              <Grid item xs={6}>
                <MetricWithSuffix
                  content='2 years • 3 months'
                  tooltipKey='05'
                  titleKey='Lending History'
                />
              </Grid>
              <Grid item xs={6}>
                <MetricWithSuffix
                  content='Invoice Financing'
                  tooltipKey='01'
                  titleKey='Asset class'
                />
              </Grid>
            </Grid>
            <Box
              className='light-blue-background'
              sx={{ mt: 1, borderRadius: 1 }}
            >
              <InfoRow
                title='Industry Exposure'
                toolTipInfo='info'
                showDivider
                metric='Accounting Firms'
              />
              <InfoRow
                title='Term & Structure'
                toolTipInfo='info'
                showDivider
                metric='Revolving'
              />
              <InfoRow
                title='Pool APY Structure'
                toolTipInfo='info'
                metric='Fixed'
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OverviewDetails
