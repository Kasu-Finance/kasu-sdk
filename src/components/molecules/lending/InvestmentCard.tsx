import { Card, CardContent, CardHeader, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

interface InvestmentCardProps {
  title: string
  amount: string
  apy: string
  yieldEarned: string
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  title,
  amount,
  apy,
  yieldEarned,
}) => {
  return (
    <Box
      className='light-blue-background'
      sx={{ minWidth: 275, margin: 0, p: 0, borderRadius: '8px' }}
    >
      <Typography
        sx={{ pl: 2, pt: 2, pb: 1 }}
        variant='subtitle1'
        component='h6'
      >
        {title}
      </Typography>
      <InfoRow
        title='Amount invested'
        toolTipInfo='01'
        showDivider
        metric={<ContentWithSuffix content={amount} suffix='USDC' />}
      />

      <InfoRow
        title='Tranch APY'
        toolTipInfo='02'
        showDivider
        metric={<ContentWithSuffix content={apy + ' %'} />}
      />
      <InfoRow
        title='Yield Earned'
        toolTipInfo='03'
        metric={<ContentWithSuffix content={yieldEarned} suffix='USDC' />}
      />
    </Box>
  )
}

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
          <InvestmentCard
            title='Senior Tranche'
            amount='10,000.00'
            apy='4.50'
            yieldEarned='1,000.00'
          />
        </Grid>
        <Grid item xs={4}>
          <InvestmentCard
            title='Mezzanine Tranche'
            amount='10,000.00'
            apy='4.50'
            yieldEarned='1,000.00'
          />
        </Grid>
        <Grid item xs={4}>
          <InvestmentCard
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
