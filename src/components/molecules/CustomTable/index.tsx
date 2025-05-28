import {
  Pagination,
  PaginationProps,
  Stack,
  StackProps,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material'
import type { ReactNode } from 'react'

type CustomTableProps = StackProps & {
  tableContainerSx?: SxProps
  tableSx?: SxProps
  tableHeaderSx?: SxProps
  tableBodySx?: SxProps
  tableFooterSx?: SxProps
  tableHeader: ReactNode
  tableBody: ReactNode
  tableFooter?: ReactNode
  paginationProps?: PaginationProps
}

const CustomTable: React.FC<CustomTableProps> = ({
  tableContainerSx,
  tableSx,
  tableHeaderSx,
  tableBodySx,
  tableFooterSx,
  tableHeader,
  tableBody,
  tableFooter,
  paginationProps,
  ...rest
}) => {
  return (
    <Stack
      spacing={3}
      pb={2}
      {...rest}
      sx={[
        {
          width: '100%',
          alignItems: 'center',
        },
        ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
      ]}
    >
      <TableContainer
        sx={[
          { border: 'none' },
          ...(Array.isArray(tableContainerSx)
            ? tableContainerSx
            : [tableContainerSx]),
        ]}
      >
        <Table
          sx={[
            {
              borderRadius: 2,
              overflow: 'hidden',
              background: `url("/images/wave-white.png") repeat`,
              tableLayout: 'fixed',
            },
            ...(Array.isArray(tableSx) ? tableSx : [tableSx]),
          ]}
        >
          <TableHead
            sx={[
              {
                height: 69,
                '& .MuiTableCell-root': {
                  border: 'none',
                  fontWeight: 600,
                },
              },
              ...(Array.isArray(tableHeaderSx)
                ? tableHeaderSx
                : [tableHeaderSx]),
            ]}
          >
            {tableHeader}
          </TableHead>
          <TableBody
            sx={[
              {
                bgcolor: 'white',
                'tr:first-child': {
                  'td:first-child': {
                    borderTopLeftRadius: 8,
                  },
                  'td:last-child': {
                    borderTopRightRadius: 8,
                  },
                },
                '.MuiTableCell-root': {
                  border: 'none',
                },
              },
              ...(Array.isArray(tableBodySx) ? tableBodySx : [tableBodySx]),
            ]}
          >
            {/* add spacing before tablebody */}
            <TableRow>
              <TableCell sx={{ p: 1 }} colSpan={100} />
            </TableRow>
            {tableBody}
          </TableBody>
          {tableFooter && (
            <TableFooter sx={tableFooterSx}>{tableFooter}</TableFooter>
          )}
        </Table>
      </TableContainer>
      {paginationProps && (
        <Pagination
          color='primary'
          boundaryCount={2}
          siblingCount={0}
          {...paginationProps}
        />
      )}
    </Stack>
  )
}

export default CustomTable
