import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

interface TableSkeletonProps {
  rows: number
  columns: number
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows, columns }) => {
  return (
    <Box>
      <TableContainer>
        <Table aria-label='skeleton table'>
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }, (_, index) => (
                <TableCell key={index}>
                  <Skeleton variant='text' />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }, (_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton variant='text' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default TableSkeleton
