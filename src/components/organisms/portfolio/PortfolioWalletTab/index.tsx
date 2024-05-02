import WalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CachedIcon from '@mui/icons-material/Cached'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

const PortfolioWalletTab = () => {
  const { account } = useWeb3React()

  return (
    <>
      <CardHeader title='My Wallet' />
      <CardContent>
        <InfoColumn
          title='Connected Wallet'
          showDivider
          metric={
            <Typography
              variant='h6'
              component='span'
              display='block'
              pt='6px'
              pl={2}
            >
              {account
                ? `0x ${account.substring(2).match(/.{4}/g).join(' ')}`
                : '-'}{' '}
            </Typography>
          }
        />
        <Grid mt={2} container spacing={2}>
          <Grid item xs={6}>
            <ColoredBox>
              <InfoColumn
                title='Wallet Balance'
                toolTipInfo='info'
                showDivider
                metric={
                  <Box pt='6px' pl={2}>
                    <Typography variant='h6' component='span'>
                      -
                    </Typography>
                  </Box>
                }
              />
            </ColoredBox>
            <Button
              variant='contained'
              sx={{ mt: 2, mx: 'auto', display: 'flex' }}
              startIcon={<CachedIcon />}
            >
              CONVERT TO KSU
            </Button>
          </Grid>
          <Grid item xs={6}>
            <ColoredBox>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <InfoColumn
                    title='Total KSU Balance'
                    toolTipInfo='info'
                    showDivider
                    metric={
                      <TokenAmount
                        amount='0.00'
                        symbol='KSU'
                        usdValue='0.00'
                        pt='6px'
                        pl={2}
                      />
                    }
                  />
                </Grid>
                <Grid item xs={5}>
                  <InfoColumn
                    title='Availablbe Funds'
                    toolTipInfo='info'
                    showDivider
                    metric={
                      <TokenAmount
                        amount='0.00'
                        symbol='USDC'
                        pt='6px'
                        pl={2}
                      />
                    }
                  />
                </Grid>
              </Grid>
            </ColoredBox>
            <Button
              variant='contained'
              sx={{ mt: 2, mx: 'auto', display: 'flex' }}
              startIcon={<WalletIcon />}
            >
              BUY KSU
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </>
  )
}

export default PortfolioWalletTab
