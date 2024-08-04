import { TableSortLabel, Typography, TypographyProps } from '@mui/material'
import { ReactNode } from 'react'

import { Sort } from '@/components/molecules/CustomTable'

type CustomTableSortLabelProps<T extends readonly any[]> = {
  label: ReactNode
  sort: Sort<T>
  sortKey: T[number]
  handleSortChange: (key: T[number]) => void
  flipIcon?: boolean
  variant?: TypographyProps['variant']
  disableSort?: boolean
}

const CustomTableSortLabel = <T extends readonly any[]>({
  label,
  sortKey,
  sort,
  handleSortChange,
  flipIcon,
  variant = 'subtitle2',
  disableSort,
}: CustomTableSortLabelProps<T>) => {
  const isActive = sort.key === sortKey

  return disableSort ? (
    <Typography
      variant={variant}
      fontWeight={500}
      textTransform='capitalize'
      width='max-content'
    >
      {label}
    </Typography>
  ) : (
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
      <Typography
        variant={variant}
        fontWeight={500}
        textTransform='capitalize'
        width='max-content'
      >
        {label}
      </Typography>
    </TableSortLabel>
  )
}

export default CustomTableSortLabel
