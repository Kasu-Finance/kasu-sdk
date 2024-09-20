import { Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import BuyKsuOverview from '@/components/organisms/portfolio/PortfolioWalletTab/BuyKsuOverview'
import WalletBalances from '@/components/organisms/portfolio/PortfolioWalletTab/WalletBalances'

const WalletBalance = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('portfolio.wallet.title')}
      </Typography>
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Typography variant='h5' mt={2}>
          {t('portfolio.wallet.connectedWallet')}
        </Typography>
        <WalletBalances />
        <Grid container columnSpacing={4} mt={6}>
          <Grid item xs={6}>
            <Typography variant='h5' textTransform='capitalize'>
              KSU {t('general.balance')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='h5' textTransform='capitalize'>
              {t('general.availableFunds')}
            </Typography>
          </Grid>
          <BuyKsuOverview />
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default WalletBalance
