import {
  styled,
  TableCell,
  TablePagination,
  TableSortLabel,
} from '@mui/material'

export const BorderTableCell = styled(TableCell)(({ theme }) => ({
  position: 'relative',
  '&:not(:last-child)': {
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '1.5rem',
      bottom: '1.2rem',
      width: '2px',
      backgroundColor: theme.palette.grey[300],
    },
  },
}))

export const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  '& .MuiTableSortLabel-icon': {
    color: theme.palette.icon.primary,
    '&:hover': {
      color: theme.palette.icon.primary,
    },
  },
  '&:hover': {
    color: 'inherit',
    '& .MuiTableSortLabel-icon': {
      color: theme.palette.icon.primary,
    },
  },
  '&.Mui-active': {
    '& .MuiTableSortLabel-icon': {
      color: theme.palette.icon.primary,
    },
  },
}))

export const StyledTableCell = styled(TableCell)(() => ({
  width: '33.33%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}))

export const StyledTablePagination = styled(TablePagination)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  border: 'none',

  '.MuiTablePagination-selectLabel': {
    marginTop: '0.5em',
    marginRight: '-0.5em',
    color: theme.palette.grey[400],
  },
  '.MuiSelect-icon': {
    marginTop: '-2px',
  },
  '.MuiTablePagination-displayedRows': {
    color: theme.palette.common.black,
    marginBottom: '1rem',
  },
}))
