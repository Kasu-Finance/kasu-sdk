'use client'

import { Pagination, Stack } from '@mui/material'
import { FinancialReportingDocuments as FinancialReportingDocumentsType } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import usePagination from '@/hooks/usePagination'
import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CustomTableTest from '@/components/molecules/CustomTableTest'
import FinancialReportingDocumentsTableBody from '@/components/organisms/lending/RiskReportingTab/FinancialReportingDocuments/FinancialReportingDocumentsTableBody'
import FinancialReportingDocumentsTableHeader from '@/components/organisms/lending/RiskReportingTab/FinancialReportingDocuments/FinancialReportingDocumentsTableHeader'

type FinancialReportingDocumentsProps = {
  documents: FinancialReportingDocumentsType
}

const ROWS_PER_PAGE = 5

const FinancialReportingDocuments: React.FC<
  FinancialReportingDocumentsProps
> = ({ documents }) => {
  const { t } = useTranslation()

  const documentsCount = documents.documents.length

  const { currentPage, setPage, paginateData } = usePagination(
    ROWS_PER_PAGE,
    documentsCount
  )

  return (
    <CustomCard>
      <CustomCardHeader title={t('risk.reporting.title')} />
      <CustomInnerCardContent sx={{ p: 0 }}>
        <Stack alignItems='center' pb={2}>
          <CustomTableTest
            tableHeader={<FinancialReportingDocumentsTableHeader />}
            tableBody={
              <FinancialReportingDocumentsTableBody
                documents={paginateData([...documents.documents])}
              />
            }
          />
          {documentsCount > ROWS_PER_PAGE && (
            <Pagination
              color='primary'
              boundaryCount={2}
              siblingCount={0}
              count={Math.ceil(documentsCount / ROWS_PER_PAGE)}
              page={currentPage}
              onChange={(_, page) => setPage(page)}
              sx={{ mb: 1 }}
            />
          )}
        </Stack>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default FinancialReportingDocuments
