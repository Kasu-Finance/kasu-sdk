import {
  Pagination,
  PaginationProps,
  Stack,
  SxProps,
  Table,
  TableBody,
  TableContainer,
  TableFooter,
  TableHead,
} from '@mui/material'
import type { ReactNode } from 'react'

type CustomTableTestProps = {
  tableContainerSx?: SxProps
  tableSx?: SxProps
  tableHeaderSx?: SxProps
  tableFooterSx?: SxProps
  tableHeader: ReactNode
  tableBody: ReactNode
  tableFooter?: ReactNode
  paginationProps?: PaginationProps
}

const CustomTableTest: React.FC<CustomTableTestProps> = ({
  tableContainerSx,
  tableSx,
  tableHeaderSx,
  tableFooterSx,
  tableHeader,
  tableBody,
  tableFooter,
  paginationProps,
}) => {
  return (
    <Stack
      sx={{
        width: '100%',
        boxShadow: '0px 5px 20px 0px rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
      }}
      spacing={3}
      pb={2}
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
            sx={{
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
            }}
          >
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

export default CustomTableTest
