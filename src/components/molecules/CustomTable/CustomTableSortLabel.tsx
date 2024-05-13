import { TableSortLabel, Typography, TypographyProps } from '@mui/material'

import { Sort } from '@/components/molecules/CustomTable'

type CustomTableSortLabelProps<T extends readonly any[]> = {
  label: string
  sort: Sort<T>
  sortKey: T[number]
  handleSortChange: (key: T[number]) => void
  flipIcon?: boolean
  variant?: TypographyProps['variant']
}

const CustomTableSortLabel = <T extends readonly any[]>({
  label,
  sortKey,
  sort,
  handleSortChange,
  flipIcon,
  variant = 'subtitle2',
}: CustomTableSortLabelProps<T>) => {
  const isActive = sort.key === sortKey

  return (
    <TableSortLabel
      direction={isActive ? sort.direction : 'desc'}
      active={isActive}
      onClick={() => handleSortChange(sortKey)}
      sx={
        flipIcon
          ? {
              '.MuiTableSortLabel-icon': {
                order: -1,
              },
            }
          : undefined
      }
    >
      <Typography variant={variant} fontWeight={500}>
        {label}
      </Typography>
    </TableSortLabel>
  )
}

export default CustomTableSortLabel
