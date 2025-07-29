import {
  SxProps,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from '@mui/material'
import React, { ReactNode } from 'react'

import { customTypography } from '@/themes/typography'

type LiteModeTableProps = {
  tableContainerSx?: SxProps
  tableSx?: SxProps
  tableHeaderSx?: SxProps
  tableBodySx?: SxProps
  tableHeader: ReactNode
  tableBody: ReactNode
}

const LiteModeTable: React.FC<LiteModeTableProps> = ({
  tableBody,
  tableHeader,
  tableBodySx,
  tableContainerSx,
  tableHeaderSx,
  tableSx,
}) => {
  return (
    <TableContainer
      sx={[
        {
          border: 'none',
        },
        ...(Array.isArray(tableContainerSx)
          ? tableContainerSx
          : [tableContainerSx]),
      ]}
    >
      <Table
        sx={[
          {
            tableLayout: 'fixed',
            '.MuiTableCell-root': {
              color: 'white',
            },
          },
          ...(Array.isArray(tableSx) ? tableSx : [tableSx]),
        ]}
      >
        <TableHead
          sx={[
            {
              '& .MuiTableCell-root': {
                ...customTypography.baseSmBold,
                border: 'none',
                px: 0,
              },
            },
            ...(Array.isArray(tableHeaderSx) ? tableHeaderSx : [tableHeaderSx]),
          ]}
        >
          {tableHeader}
        </TableHead>
        <TableBody
          sx={[
            {
              '.MuiTableCell-root': {
                ...customTypography.baseSm,
                border: 'none',
                px: 0,
              },
            },
            ...(Array.isArray(tableBodySx) ? tableBodySx : [tableBodySx]),
          ]}
        >
          {tableBody}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default LiteModeTable
