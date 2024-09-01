import { Box, Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import WaveBox from '@/components/atoms/WaveBox'
import AggregatedFundsFlow from '@/components/organisms/lending/RepaymentsTab/AggregatedFundsFlow'
import CsvDownloadButton from '@/components/organisms/lending/RepaymentsTab/CsvDownloadButton'
import RepaymentSection from '@/components/organisms/lending/RepaymentsTab/RepaymentSection'

import { getRepayments } from '@/app/_requests/repayments'

type PoolDetailsProps = {
  poolId: string
}

const RepaymentsTab: React.FC<PoolDetailsProps> = async ({ poolId }) => {
  const repayment = await getRepayments(poolId)

  const { t } = useTranslation()

  return (
    <CustomCard sx={{ mt: 3 }}>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('repayments.title')}
      </Typography>
      <WaveBox borderRadius={2}>
        <Box px={2} py={3} display='flex' flexDirection='column'>
          <Typography variant='baseMd' component='p'>
            {t('repayments.loanModelDescription')}
          </Typography>
          {repayment && (
            <>
              <Typography
                variant='baseMd'
                my={2}
                textAlign='center'
                display='block'
                component='p'
              >
                {t('repayments.borrowerFundsCSV')}
              </Typography>
              <CsvDownloadButton repayment={repayment} />
            </>
          )}
        </Box>
        <CustomInnerCardContent sx={{ py: 3 }}>
          <AggregatedFundsFlow repayment={repayment} />
          {repayment && (
            <Grid container columnSpacing={4} mt={6}>
              <Grid item xs={6}>
                <RepaymentSection
                  title={t('repayments.sections.cumulativeFunds.title')}
                  subtitle={t(
                    'repayments.sections.cumulativeFunds.titleSuffix'
                  )}
                  data={repayment.cumulativeLendingFundsFlow}
                  unit='USD'
                />
                <RepaymentSection
                  title={t('repayments.sections.upcomingFunds.title')}
                  subtitle={t('repayments.sections.upcomingFunds.titleSuffix')}
                  data={repayment.upcomingLendingFundsFlow}
                  unit='USD'
                  mt={6}
                />
              </Grid>
              <Grid item xs={6} display='flex' flexDirection='column'>
                <RepaymentSection
                  title={t('repayments.sections.transactions.title')}
                  subtitle={t('repayments.sections.transactions.titleSuffix')}
                  data={repayment.cumulativeLendingAndWithdrawals}
                  unit='USDC'
                />
                <RepaymentSection
                  title={t('repayments.sections.fundsRequest.title')}
                  subtitle={t('repayments.sections.fundsRequest.titleSuffix')}
                  data={repayment.lendingAndWithdrawalRequests}
                  unit='USDC'
                  mt='auto'
                />
              </Grid>
            </Grid>
          )}
        </CustomInnerCardContent>
      </WaveBox>
    </CustomCard>
  )
}

export default RepaymentsTab
