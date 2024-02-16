import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material'

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
        STRATEGY DECK
      </Button>
    }
  />
)

const OverviewCard = () => {
  return (
    <Card sx={{ minWidth: 275, boxShadow: 3 }} elevation={1}>
      <OverviewTitle />

      <CardContent>
        <Typography variant='body2'>
          By engaging in Cash Management, companies can extend runway, hedge
          against inflation, and manage cash flows. The Pool is designed to meet
          the conservative risk profile and daily liquidity needs of DAOs,
          Offshore Companies and Web3 Treasuries. The pool passes yield sourced
          from US Treasury bills and reverse repurchase agreements, less fees of
          0.5% of yield, to Lenders.
        </Typography>
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}></Box>
    </Card>
  )
}

export default OverviewCard
