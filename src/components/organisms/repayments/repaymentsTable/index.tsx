import { Box, SxProps, TableRow, Theme } from '@mui/material'
import React from 'react'

import CustomTable, {
  CustomTableHeader,
  Sort,
} from '@/components/molecules/CustomTable'
import {
  BorderTableCell,
  StyledTableCell,
  StyledTablePagination,
  StyledTableSortLabel,
} from '@/components/organisms/repayments/repaymentsTable/styled'

import { RepaymentsData } from '@/app/mock-data/repayments-data'
import { sortByDate, sortByNumber, sortByString } from '@/utils'

enum RepaymentTableSortKey {
  SOURCE = 'source',
  REPAYMENT_DATE = 'repaymentDate',
  REPAYMENT_AMOUNT = 'repaymentAmount',
}

const headers: CustomTableHeader<RepaymentsData>[] = [
  { label: 'Source', value: 'source' },
  { label: 'Repayment Date', value: 'repaymentDate' },
  { label: 'Repayment Amount', value: 'repaymentAmount' },
]

const tableRowStyle: SxProps<Theme> = {
  background: 'transparent',
  '& > *': {
    textAlign: 'left !important',
  },
}

const handleSort = <T extends RepaymentsData>(
  a: T,
  b: T,
  sort: Sort<T>
): number => {
  const { key, direction } = sort

  let sortingFunction: (a: T, b: T) => number

  if (key === RepaymentTableSortKey.REPAYMENT_DATE) {
    sortingFunction = sortByDate<T>(key, direction)
  } else if (key === RepaymentTableSortKey.REPAYMENT_AMOUNT) {
    sortingFunction = sortByNumber<T>(key, direction)
  } else {
    sortingFunction = sortByString<T>(key, direction)
  }

  return sortingFunction(a, b)
}

interface RepaymentsTableProps {
  data: RepaymentsData[]
}

const RepaymentsTable: React.FC<RepaymentsTableProps> = ({ data }) => {
  return (
    <Box>
      <CustomTable
        ariaLabel='Repayments Table'
        data={data}
        headers={headers}
        defaultSortKey={RepaymentTableSortKey.SOURCE}
        handleSort={handleSort}
        tableRowStyle={tableRowStyle}
        TableCellComp={BorderTableCell}
        SortLabelComp={StyledTableSortLabel}
        PaginationComp={StyledTablePagination}
      >
        {(sortedData) =>
          sortedData.map((row) => (
            <TableRow key={`${row.id}_${row.source}`}>
              <StyledTableCell>{row.source}</StyledTableCell>
              <StyledTableCell>{row.repaymentDate}</StyledTableCell>
              <StyledTableCell>$ {row.repaymentAmount}</StyledTableCell>
            </TableRow>
          ))
        }
      </CustomTable>
    </Box>
  )
}

export default RepaymentsTable
