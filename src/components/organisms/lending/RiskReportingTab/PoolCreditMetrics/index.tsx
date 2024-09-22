import { PoolCreditMetrics as PoolCreditMetricsType } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CustomTableTest from '@/components/molecules/CustomTableTest'
import PoolCreditMetricsTableBody from '@/components/organisms/lending/RiskReportingTab/PoolCreditMetrics/PoolCreditMetricsTableBody'
import PoolCreditMetricsTableHeader from '@/components/organisms/lending/RiskReportingTab/PoolCreditMetrics/PoolCreditMetricsTableHeader'

type PoolCreditMetricsProps = {
  poolCreditMetrics: PoolCreditMetricsType
}

const PoolCreditMetrics: React.FC<PoolCreditMetricsProps> = async ({
  poolCreditMetrics,
}) => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('risk.poolCredit.title')} />
      <CustomInnerCardContent sx={{ p: 0 }}>
        <CustomTableTest
          tableHeader={<PoolCreditMetricsTableHeader />}
          tableBody={
            <PoolCreditMetricsTableBody poolCreditMetrics={poolCreditMetrics} />
          }
        />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default PoolCreditMetrics
