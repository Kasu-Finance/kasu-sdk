import { Card, CardContent, CardHeader } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import TranchInvestmentCard from '@/components/molecules/TranchInvestmentCard'

const InvestmentPortfolio = () => {
  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title='Pool Overview'
        titleTypographyProps={{
          variant: 'h6',
          component: 'h6',
          m: 0,
        }}
        action={
          <Button
            variant='outlined'
            sx={{ height: '30px', top: 4, right: 8 }}
            size='small'
          >
            Your investment
          </Button>
        }
      />
      <Grid container columnSpacing={3} rowGap={2} component={CardContent}>
        <Grid item xs={12}>
          <Box
            borderRadius={2}
            className='light-blue-background'
            sx={{
              flexGrow: 1,
              mt: 2,
              mb: 2,
            }}
          >
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
                  titleKey='lending.tranche.senior'
                />
              </Grid>
              <Grid item xs={4}>
                <MetricWithSuffix
                  content='5.50 %'
                  tooltipKey='01'
                  titleKey='lending.tranche.mezzanine'
                />
              </Grid>
              <Grid item xs={4}>
                <MetricWithSuffix
                  content=' 2.4 %'
                  tooltipKey='01'
                  titleKey='lending.tranche.junior'
                />
              </Grid>
            </Grid>
          </Box>{' '}
        </Grid>
        <Grid item xs={4}>
          <TranchInvestmentCard
            title='Senior Tranche'
            amount='10,000.00'
            apy='4.50'
            yieldEarned='1,000.00'
          />
        </Grid>
        <Grid item xs={4}>
          <TranchInvestmentCard
            title='Mezzanine Tranche'
            amount='10,000.00'
            apy='4.50'
            yieldEarned='1,000.00'
          />
        </Grid>
        <Grid item xs={4}>
          <TranchInvestmentCard
            title='Junior Tranche'
            amount='10,000.00'
            apy='4.50'
            yieldEarned='1,000.00'
          />
        </Grid>
      </Grid>
      <Box
        display='flex'
        justifyContent='center'
        width='100%'
        sx={{
          pt: 0,
          pl: 0,
          pr: 0,
          pb: 2,
        }}
      >
        <Button variant='contained'>Withdraw</Button>
      </Box>
    </Card>
  )
}

export default InvestmentPortfolio
