'use client'

import { Box, TablePagination } from '@mui/material'
import React, { useMemo, useState } from 'react'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CustomTable from '@/components/molecules/CustomTable'
import BorrowerScheduleTableBody from '@/components/organisms/lending/RiskReportingTab/BorrowerSchedule/BorrowerScheduleTableBody'
import BorrowerScheduleTableFooter from '@/components/organisms/lending/RiskReportingTab/BorrowerSchedule/BorrowerScheduleTableFooter'
import BorrowerScheduleTableHeader from '@/components/organisms/lending/RiskReportingTab/BorrowerSchedule/BorrowerScheduleTableHeader'

import type {
  AggregatedBorrowerData,
  AgingBuckets,
  BorrowerData,
  FundingReportType,
} from '@/types/riskReporting'

type BorrowerScheduleProps = {
  agingBuckets: AgingBuckets
  borrowers: BorrowerData[]
  totals: AggregatedBorrowerData
  reportType: FundingReportType
}

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100]
const DEFAULT_ROWS_PER_PAGE = 20

/**
 * Get section title based on funding/report type
 * - Tax Pay: "Duration Schedule"
 * - Whole Ledger: "Borrower Schedule"
 * - Professional Fee: "Duration Schedule"
 */
const getSectionTitle = (reportType: FundingReportType): string => {
  switch (reportType) {
    case 'wholeLedger':
      return 'Borrower Schedule'
    case 'taxPay':
    case 'professionalFee':
    default:
      return 'Duration Schedule'
  }
}

const BorrowerSchedule: React.FC<BorrowerScheduleProps> = ({
  agingBuckets,
  borrowers,
  totals,
  reportType,
}) => {
  const sectionTitle = getSectionTitle(reportType)

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Paginated borrowers
  const paginatedBorrowers = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return borrowers.slice(start, end)
  }, [borrowers, page, rowsPerPage])

  return (
    <CustomCard>
      <CustomCardHeader title={sectionTitle} />
      <CustomInnerCardContent sx={{ p: 0 }}>
        <CustomTable
          tableContainerSx={{ overflowX: 'auto' }}
          tableSx={{ minWidth: 1200, tableLayout: 'auto' }}
          tableHeader={
            <BorrowerScheduleTableHeader agingBuckets={agingBuckets} />
          }
          tableBody={
            <BorrowerScheduleTableBody
              borrowers={paginatedBorrowers}
              agingBuckets={agingBuckets}
            />
          }
          tableFooter={
            <BorrowerScheduleTableFooter
              totals={totals}
              agingBuckets={agingBuckets}
            />
          }
        />
        {borrowers.length > ROWS_PER_PAGE_OPTIONS[0] && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <TablePagination
              component='div'
              count={borrowers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage='Rows per page:'
              slotProps={{
                select: {
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        bgcolor: '#FFFFFF',
                        '& .MuiMenuItem-root': {
                          color: '#28282A',
                          fontSize: 14,
                          '&:hover': {
                            bgcolor: 'rgba(205, 163, 112, 0.1)',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(205, 163, 112, 0.2)',
                            '&:hover': {
                              bgcolor: 'rgba(205, 163, 112, 0.3)',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              }}
              sx={{
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows':
                  {
                    fontFamily: '"Open Sans", sans-serif',
                    fontSize: 12,
                  },
              }}
            />
          </Box>
        )}
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default BorrowerSchedule
