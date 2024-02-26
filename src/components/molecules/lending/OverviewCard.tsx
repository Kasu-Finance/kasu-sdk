import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
} from '@mui/material'

import InfoTooltip from '@/components/atoms/InfoTooltip'

const OverviewTitle = () => (
  <CardHeader
    title=' Pool Overview'
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
        Strategy deck
      </Button>
    }
  />
)

const OverviewCard = () => {
  return (
    <Card sx={{ minWidth: 275, boxShadow: 3 }} elevation={1}>
      <OverviewTitle />

      <CardContent>
        <Typography variant='body1'>
          By engaging in Cash Management, companies can extend runway, hedge
          against inflation, and manage cash flows. The Pool is designed to meet
          the conservative risk profile and daily liquidity needs of DAOs,
          Offshore Companies and Web3 Treasuries. The pool passes yield sourced
          from US Treasury bills and reverse repurchase agreements, less fees of
          0.5% of yield, to Lenders.
        </Typography>
      </CardContent>
      <Box
        sx={{
          flexGrow: 1,
          m: 2,
          background: '#1976D20A',
          borderRadius: '8px',
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
            <Box>
              <Typography variant='subtitle2' sx={{ pl: 2, pb: 1 }}>
                Senior Tranche APY <InfoTooltip title='test' />
              </Typography>
              <Divider />
              <Typography variant='h5' sx={{ pl: 2, pb: 1, pt: 0.5 }}>
                12.50 %
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box>
              <Typography variant='subtitle2' sx={{ pl: 2, pb: 1 }}>
                Mezzanine Tranche <InfoTooltip title='test' />
              </Typography>
              <Divider />
              <Typography variant='h5' sx={{ pl: 2, pb: 1, pt: 0.5 }}>
                5.50 %
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box>
              <Typography variant='subtitle2' sx={{ pl: 2, pb: 1 }}>
                Junior Tranche <InfoTooltip title='test' />
              </Typography>
              <Divider />
              <Typography variant='h5' sx={{ pl: 2, pb: 1, pt: 0.5 }}>
                2.4 %
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <CardActions
        sx={{ pt: 0, pl: 0, pr: 0, pb: 2, justifyContent: 'center' }}
      >
        <Button variant='contained'>Deposit</Button>
      </CardActions>
    </Card>
  )
}

export default OverviewCard
