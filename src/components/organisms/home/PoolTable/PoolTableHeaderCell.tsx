import { Box, TableCell, TableCellProps } from '@mui/material'

import ToolTip from '@/components/atoms/ToolTip'

type PoolTableHeaderCellProps = TableCellProps & {
  label: string
  toolTip?: string
}

const PoolTableHeaderCell: React.FC<PoolTableHeaderCellProps> = ({
  label,
  toolTip,
  ...rest
}) => (
  <TableCell
    sx={{
      textTransform: 'capitalize',
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
