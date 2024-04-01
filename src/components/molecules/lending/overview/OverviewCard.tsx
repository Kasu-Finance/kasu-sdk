import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Link,
  Typography,
} from '@mui/material'

import useModalState from '@/hooks/context/useModalState'

import ColoredBox from '@/components/atoms/ColoredBox'
import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoRow from '@/components/atoms/InfoRow'
import NextLink from '@/components/atoms/NextLink'
import ToolTip from '@/components/atoms/ToolTip'
import OverviewTitle from '@/components/molecules/details/OverviewTitle'
import InvestmentPortfolio from '@/components/molecules/lending/overview/InvestmentCard'
import OverviewDetails from '@/components/molecules/lending/overview/OverviewDetails'
import TranchesApyCard from '@/components/molecules/lending/overview/TranchesApyCard'
import TranchesDetailsCard from '@/components/molecules/lending/overview/TranchesDetails'
import LendingLoyalityInfo from '@/components/molecules/locking/LoyaltyOverview/LendingLoyalityInfo'

import { LockIcon, WalletIcon } from '@/assets/icons'

const PoolOverview = () => {
  const { openModal } = useModalState()
  const handleOpenLockingKSU = () => openModal({ name: 'lockModal' })

  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          height: 352,
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

      <OverviewDetails />
      <TranchesDetailsCard />
      <InvestmentPortfolio />

      {
        // Your KSU tokens
      }
      <Card sx={{ mt: 3 }}>
        <CardHeader
          title='Your KSU Status'
          titleTypographyProps={{
            variant: 'h6',
            component: 'h6',
            m: 0,
          }}
        />

        <Grid
          container
          direction='row'
          justifyContent='flex-start'
          alignItems='stretch'
          columnSpacing={3}
          sx={{ p: 2, pb: 0 }}
        >
          <Grid item xs={6}>
            <LendingLoyalityInfo />
          </Grid>
          <Grid item xs={6}>
            <InfoRow
              title='Total KSU Locked'
              sx={{ pl: 0 }}
              toolTipInfo='dsds'
            />
            <Divider />
            <ContentWithSuffix content='1.00 M' suffix='KSU' sx={{ pl: 0 }} />
            <Typography mt={2} variant='subtitle1'>
              Lending Bonus & Rewards
            </Typography>
            <Typography variant='caption'>
              Related to This Lending Pool Only
            </Typography>
            <ColoredBox sx={{ mt: 2, mb: 2 }}>
              <InfoRow
                title='Amount invested'
                toolTipInfo='01'
                showDivider
                metric={<ContentWithSuffix content='0.10 %' />}
              />
              <InfoRow
                title='Total Bonus Yield Earnings​'
                toolTipInfo='01'
                showDivider
                metric={
                  <div>
                    <ContentWithSuffix
                      textAlign='right'
                      content='500.00'
                      suffix='KSU'
                    />
                    <Typography
                      textAlign='right'
                      sx={{ fontSize: '12px' }}
                      variant='caption'
                      component='h6'
                    >
                      250.00 USDC
                    </Typography>
                  </div>
                }
              />
              <InfoRow
                title='Lifetime Bonus Yield Earnings​​'
                toolTipInfo='01'
                showDivider
                metric={
                  <div>
                    <ContentWithSuffix
                      textAlign='right'
                      content='500.00'
                      suffix='KSU'
                    />
                    <Typography
                      textAlign='right'
                      sx={{ fontSize: '12px' }}
                      variant='caption'
                      component='h6'
                    >
                      250.00 USDC
                    </Typography>
                  </div>
                }
              />
              <Box sx={{ pl: 2, py: 1 }}>
                <Link
                  display='inline-block'
                  textTransform='none'
                  sx={{
                    textDecoration: 'none',
                  }}
                  component={NextLink}
                  href='#'
                >
                  View KSU Locking for all other rewards
                </Link>
                <ToolTip sx={{ display: 'inline-block' }} title='tooltip' />
              </Box>
            </ColoredBox>
          </Grid>
        </Grid>
        <Grid
          container
          direction='row'
          justifyContent='flex-start'
          alignItems='stretch'
          columnSpacing={3}
          sx={{ pb: 2, pt: 0 }}
        >
          <Grid item xs={6}>
            <Box display='flex' justifyContent='end' width='100%'>
              <Button
                onClick={handleOpenLockingKSU}
                variant='contained'
                startIcon={<LockIcon />}
              >
                Lock KSU
              </Button>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant='contained'
              href='https://www.google.com'
              target='_blank'
              startIcon={<WalletIcon />}
            >
              Buy KSU
            </Button>
          </Grid>
        </Grid>
      </Card>
    </>
  )
}

export default PoolOverview
