'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import InvestmentPortfolio from '@/components/molecules/lending/InvestmentCard'
import TranchesApyCard from '@/components/molecules/lending/overview/TranchesApyCard'

const OverviewTitle = () => {
  const { t } = useTranslation()

  return (
    <CardHeader
      title='Pool Overview'
      titleTypographyProps={{
        variant: 'h6',
        component: 'h6',
        m: 0,
      }}
      action={
        <Button
          variant='contained'
          sx={{ height: '30px', top: 4, right: 8 }}
          size='small'
        >
          {t('lending.strategyDeck')}
        </Button>
      }
    />
  )
}

const PoolOverview = () => {
  const { t } = useTranslation()

  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          boxShadow: 3,
          overflow: 'inherit',
        }}
        elevation={1}
      >
        <OverviewTitle />
        <CardContent>
          <Typography variant='body1'>
            By engaging in Cash Management, companies can extend runway, hedge
            against inflation, and manage cash flows. The Pool is designed to
            meet the conservative risk profile and daily liquidity needs of
            DAOs, Offshore Companies and Web3 Treasuries. The pool passes yield
            sourced from US Treasury bills and reverse repurchase agreements,
            less fees of 0.5% of yield, to Lenders.
          </Typography>
        </CardContent>
        <TranchesApyCard />
      </Card>

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
              <Box className='light-blue-background' sx={{ mt: 1 }}>
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

      <InvestmentPortfolio />

      <Card sx={{ mt: 3, p: 2 }}>
        <CardContent sx={{ p: 0 }} className='light-blue-background'>
          <Grid
            container
            rowSpacing={1}
            width='100%'
            m={0}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          >
            <Grid item xs={4}>
              <MetricWithSuffix
                content='12.50 %'
                tooltipKey='01'
                titleKey={t('lending.tranche.senior')}
              />
            </Grid>
            <Grid item xs={4}>
              <MetricWithSuffix
                content='5.50 %'
                tooltipKey='01'
                titleKey={t('lending.tranche.mezzanine')}
              />
            </Grid>
            <Grid item xs={4}>
              <MetricWithSuffix
                content=' 2.4 %'
                tooltipKey='01'
                titleKey={t('lending.tranche.junior')}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  )
}

export default PoolOverview
