import { Grid, Typography } from '@mui/material'
import { redirect } from 'next/navigation'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import BuyKsuOverview from '@/components/organisms/portfolio/PortfolioWalletTab/BuyKsuOverview'
import WalletBalances from '@/components/organisms/portfolio/PortfolioWalletTab/WalletBalances'

import { Routes } from '@/config/routes'

const WalletBalance = () => {
  const { t } = getTranslation()

  return (
    <LiteModeRenderer
      renderOnLiteMode={redirect(Routes.portfolio.root.url)}
      otherwise={
        <CustomCard>
          <CustomCardHeader title={t('portfolio.wallet.title')} />
          <CustomInnerCardContent sx={{ py: 3 }}>
            <Typography variant='h5' mt={2}>
              {t('portfolio.wallet.connectedWallet')}
            </Typography>
            <WalletBalances />
            <Grid container columnSpacing={4} mt={6}>
              <Grid item xs={6}>
                <Typography variant='h5' textTransform='capitalize'>
                  KASU {t('general.balance')}
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
      }
    />
  )
}

export default WalletBalance
