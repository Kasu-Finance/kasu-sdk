import {
  Box,
  Card,
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
    <Card sx={{ minWidth: 275, boxShadow: 0, padding: 2 }} elevation={1}>
      <Box pl={2}>
        <Skeleton variant='text' width='40%' height={35} />
      </Box>

      <TableContainer>
        <Table aria-label='skeleton table'>
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }, (_, index) => (
                <TableCell key={index}>
                  <Skeleton variant='text' height={35} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }, (_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton variant='text' height={35} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default TableSkeleton
