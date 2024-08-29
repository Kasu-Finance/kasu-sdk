import { Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CustomTableTest from '@/components/molecules/CustomTableTest'
import PoolCreditMetricsTableBody from '@/components/organisms/lending/RiskReportingTab/PoolCreditMetrics/PoolCreditMetricsTableBody'
import PoolCreditMetricsTableHeader from '@/components/organisms/lending/RiskReportingTab/PoolCreditMetrics/PoolCreditMetricsTableHeader'

const PoolCreditMetrics = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('risk.poolCredit.title')}
      </Typography>
      <CustomInnerCardContent sx={{ p: 0 }}>
        <CustomTableTest
          tableHeader={<PoolCreditMetricsTableHeader />}
          tableBody={<PoolCreditMetricsTableBody />}
        />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default PoolCreditMetrics
