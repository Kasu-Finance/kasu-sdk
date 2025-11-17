import { BadAndDoubtfulDebts as BadAndDoubtfulDebtsType } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CustomTable from '@/components/molecules/CustomTable'
import BadAndDoubtfulDebtsTableBody from '@/components/organisms/lending/RiskReportingTab/BadAndDoubtfulDebts/BadAndDoubtfulDebtsTableBody'
import BadAndDoubtfulDebtsTableHeader from '@/components/organisms/lending/RiskReportingTab/BadAndDoubtfulDebts/BadAndDoubtfulDebtsTableHeader'

type BadAndDoubtfulDebtsProps = {
  badAndDoubltfulDebts: BadAndDoubtfulDebtsType
}

const BadAndDoubtfulDebts: React.FC<BadAndDoubtfulDebtsProps> = ({
  badAndDoubltfulDebts,
}) => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('risk.badDebts.title')} />
      <CustomInnerCardContent sx={{ p: 0 }}>
        <CustomTable
          tableHeader={<BadAndDoubtfulDebtsTableHeader />}
          tableBody={
            <BadAndDoubtfulDebtsTableBody
              badAndDoubltfulDebts={badAndDoubltfulDebts}
            />
          }
        />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default BadAndDoubtfulDebts
