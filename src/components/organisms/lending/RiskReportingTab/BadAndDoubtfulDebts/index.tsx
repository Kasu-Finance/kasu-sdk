import { BadAndDoubtfulDebts as BadAndDoubtfulDebtsType } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CustomTableTest from '@/components/molecules/CustomTableTest'
import BadAndDoubtfulDebtsTableBody from '@/components/organisms/lending/RiskReportingTab/BadAndDoubtfulDebts/BadAndDoubtfulDebtsTableBody'
import BadAndDoubtfulDebtsTableHeader from '@/components/organisms/lending/RiskReportingTab/BadAndDoubtfulDebts/BadAndDoubtfulDebtsTableHeader'

type BadAndDoubtfulDebtsProps = {
  badAndDoubltfulDebts: BadAndDoubtfulDebtsType
}

const BadAndDoubtfulDebts: React.FC<BadAndDoubtfulDebtsProps> = ({
  badAndDoubltfulDebts,
}) => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('risk.badDebts.title')} />
      <CustomInnerCardContent sx={{ p: 0 }}>
        <CustomTableTest
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
