import { Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import WaveCard from '@/components/molecules/WaveCard'

import { capitalize } from '@/utils'

const PoolData = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('risk.lendingStrategyData.title')}
      </Typography>
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container columnSpacing={4}>
          <Grid item xs={4}>
            <WaveCard
              title='Current Arrears'
              toolTipInfo='info'
              content='0'
              unit={capitalize(t('time.days'))}
            />
          </Grid>
          <Grid item xs={4}>
            <WaveCard
              title='Defaults'
              toolTipInfo='info'
              content='0.00'
              unit='USDC'
            />
          </Grid>
          <Grid item xs={4}>
            <WaveCard
              title='Losses'
              toolTipInfo='info'
              content='0.00'
              unit='%'
            />
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default PoolData
