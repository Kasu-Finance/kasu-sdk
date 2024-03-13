'use client'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

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

const OverviewCard = () => {
  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          height: '2000px',
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
    </>
    /*
      {/* <Card sx={{ minWidth: 275, boxShadow: 3, mt: 3 }} elevation={1}>
        <Grid container>
          <Grid item xs={6}>
            <Grid container justifyContent='space-between' columnSpacing={2}>
              <Grid item xs={6}>
                <Typography variant='subtitle2' sx={{ pl: 2, pb: 1 }}>
                  Total Value Locked (TVL) <InfoTooltip title='test' />
                </Typography>
                <Divider />

                <NumberWithUnit number='10.2 M' unit='USDC' />

                <InfoRow title='dsds' toolTipInfo='dsds' showDivider />
              </Grid>
              <Grid item xs={6}>
                <Typography variant='subtitle2' sx={{ pl: 2, pb: 1 }}>
                  Loans Under Management <InfoTooltip title='test' />
                </Typography>
                <Divider />
                <NumberWithUnit number='1 M' unit='USDC' />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            dsds
          </Grid>
        </Grid>
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
      </Card>

      <InvestmentPortfolio /> */
  )
}

export default OverviewCard
