import { Grid2 } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import WaveCard from '@/components/molecules/WaveCard'

import { formatAmount } from '@/utils'

const SummaryStatistics = () => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('repayments.summaryStatistics.title')} />
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid2 container spacing={4}>
          <Grid2 size={4}>
            <WaveCard
              title='Total Number of Borrowers'
              toolTipInfo='info'
              content='63'
              unit=''
            />
          </Grid2>
          <Grid2 size={4}>
            <WaveCard
              title='Total Outstanding Loans'
              toolTipInfo='info'
              content={formatAmount(976_763, { minDecimals: 2 })}
              unit='USD'
            />
          </Grid2>
          <Grid2 size={4}>
            <WaveCard
              title='Total Loan Drawdowns'
              toolTipInfo='info'
              content={formatAmount(2_167_000, { minDecimals: 2 })}
              unit='USD'
            />
          </Grid2>
          <Grid2 size={4}>
            <WaveCard
              title='Total Principal & Interest Repayments'
              toolTipInfo='info'
              content={formatAmount(1_595_153, { minDecimals: 2 })}
              unit='USD'
            />
          </Grid2>
          <Grid2 size={4}>
            <WaveCard
              title='Current Loan Arrears'
              toolTipInfo='info'
              content={formatAmount(0.1, { minDecimals: 2 })}
              unit='%'
            />
          </Grid2>
          <Grid2 size={4}>
            <WaveCard
              title='Historical Loss Rate'
              toolTipInfo='info'
              content={formatAmount(0, { minDecimals: 2 })}
              unit='%'
            />
          </Grid2>
        </Grid2>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default SummaryStatistics
