import { Box, TableCell, TableCellProps } from '@mui/material'
import { ReactNode } from 'react'

import ToolTip from '@/components/atoms/ToolTip'

type PoolTableHeaderCellProps = TableCellProps & {
  label: ReactNode
  toolTip?: ReactNode
}

const PoolTableHeaderCell: React.FC<PoolTableHeaderCellProps> = ({
  label,
  toolTip,
  ...rest
}) => (
  <TableCell
    sx={{
      textTransform: 'capitalize',
      whiteSpace: 'normal',
      verticalAlign: 'bottom',
      '&:not(:last-child)': {
        pr: 0,
      },
    }}
    {...rest}
  >
    <Box display='flex' alignItems='center'>
      {label}
      {toolTip && <ToolTip title={toolTip} />}
    </Box>
  </TableCell>
)

export default PoolTableHeaderCell
