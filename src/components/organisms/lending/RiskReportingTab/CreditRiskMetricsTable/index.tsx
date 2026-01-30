'use client'

import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import {
  Box,
  Checkbox,
  ClickAwayListener,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import React, { useMemo, useState } from 'react'

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100]
const DEFAULT_ROWS_PER_PAGE = 20

import { formatAmount } from '@/utils'

import type {
  AggregatedGroup,
  BorrowerData,
  FundingReportType,
} from '@/types/riskReporting'

type CreditRiskMetricsTableProps = {
  reportType: FundingReportType
  borrowers: BorrowerData[]
  aggregated: AggregatedGroup
}

// Column definition with data availability flag
type ColumnDef = {
  id: string
  label: string
  hasData: boolean
  defaultVisible: boolean
  align?: 'left' | 'right'
  width?: number
  minWidth?: number
  getValue: (row: BorrowerData | AggregatedRow) => string
}

type AggregatedRow = {
  borrowerId: string
  isTotal: boolean
  data: BorrowerData | null
}

/**
 * Get column definitions based on funding type
 */
const getColumnDefs = (reportType: FundingReportType): ColumnDef[] => {
  const isTaxPay = reportType === 'taxPay'
  const isWholeLedger = reportType === 'wholeLedger'

  return [
    {
      id: 'borrowerId',
      label: 'Customer',
      hasData: true,
      defaultVisible: true,
      align: 'left',
      width: 120,
      minWidth: 120,
      getValue: (row) => {
        if ('isTotal' in row) return row.borrowerId
        // Truncate long borrower IDs
        const id = row.borrowerId
        return id.length > 12 ? `${id.slice(0, 12)}...` : id
      },
    },
    {
      id: 'currentFunding',
      label: isTaxPay
        ? 'Current Tax Funding ($)'
        : isWholeLedger
          ? 'Current Ledger Funding ($)'
          : 'Current Invoice Funding ($)',
      hasData: true, // Available in JSON
      defaultVisible: true,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        const value =
          data.currentInvoiceFundingAmount ?? data.totalLedgerFundingAmount ?? 0
        return formatAmount(value, {
          maxDecimals: 0,
        })
      },
    },
    {
      id: 'totalAnnualTurnover',
      label: 'Total Annual Turnover ($)',
      hasData: false, // Data exists but is usually 0
      defaultVisible: false,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        return formatAmount(data.annualTurnoverInvoicingAmount ?? 0, {
          maxDecimals: 0,
        })
      },
    },
    {
      id: 'outstandingInvoices',
      label: isTaxPay ? 'Outstanding Taxes ($)' : 'Outstanding Invoices ($)',
      hasData: false, // Not reliably available
      defaultVisible: true,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        return formatAmount(data.currentOutstandingInvoicesAmount ?? 0, {
          maxDecimals: 0,
        })
      },
    },
    {
      id: 'loansOutstanding',
      label: isTaxPay
        ? 'Tax Pay Loans Outstanding ($)'
        : isWholeLedger
          ? 'Loans Outstanding ($)'
          : 'Invoices Outstanding ($)',
      hasData: true, // Available
      defaultVisible: true,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        return formatAmount(data.totalLedgerFundingAmount ?? 0, {
          maxDecimals: 0,
        })
      },
    },
    {
      id: 'dtiPercent',
      label: isTaxPay
        ? 'Tax Pay Debt to Annual Income Ratio (DTI) (%)'
        : 'Debt to Annual Income Ratio (DTI) (%)',
      hasData: false, // Not in JSON
      defaultVisible: false,
      align: 'right',
      width: 114,
      getValue: () => '-',
    },
    {
      id: 'fundedPercent',
      label: isTaxPay
        ? '% Taxes Funded (%)'
        : isWholeLedger
          ? '% Funded (%)'
          : '% Invoices Funded (%)',
      hasData: false, // Data exists but usually 0
      defaultVisible: false,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        const rate = data.totalFundingRelativeToAnnualInvoicesRate
        return rate ? `${(rate * 100).toFixed(1)}%` : '-'
      },
    },
    {
      id: 'avgLoanDuration',
      label: isTaxPay
        ? 'Average Tax Pay Loan Duration (Months)'
        : 'Average Loan Duration (Months)',
      hasData: true, // Available
      defaultVisible: true,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        // Convert from days to months (value seems to be in days based on large numbers)
        const months = data.averageLoanDurationMonths ?? 0
        // If value is > 1000, it's likely in days, convert to months
        const displayValue = months > 1000 ? months / 30 : months
        return displayValue.toFixed(1)
      },
    },
    {
      id: 'dscr',
      label: 'Debt Service Cover Ratio (DSCR)',
      hasData: false, // Not in borrower data
      defaultVisible: false,
      align: 'right',
      width: 114,
      getValue: () => '-',
    },
    {
      id: 'minimumCovenant',
      label: 'Minimum Covenant ($)',
      hasData: false, // Not in borrower data
      defaultVisible: false,
      align: 'right',
      width: 114,
      getValue: () => '-',
    },
    {
      id: 'borrowerConcentrationRisk',
      label: 'Borrower Concentration Risk (%)',
      hasData: false, // Would need calculation
      defaultVisible: false,
      align: 'right',
      width: 114,
      getValue: () => '-',
    },
    {
      id: 'totalFundedLifetime',
      label: isTaxPay
        ? 'Tax Pay Loans Funded (Lifetime) ($)'
        : isWholeLedger
          ? 'Loans Funded (Lifetime) ($)'
          : 'Invoices Funded (Lifetime) ($)',
      hasData: true, // Available
      defaultVisible: true,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        return formatAmount(data.totalFundedLifetimeAmount ?? 0, {
          maxDecimals: 0,
        })
      },
    },
    {
      id: 'recoveryAction',
      label: 'Recovery Action ($)',
      hasData: true, // Available
      defaultVisible: false,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        return formatAmount(data.unrealisedLossRecoveryActionAmount ?? 0, {
          maxDecimals: 0,
        })
      },
    },
    {
      id: 'unrealisedLossRate',
      label: 'Unrealised Loss Rate (%)',
      hasData: true, // Available
      defaultVisible: false,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        const rate = data.unrealisedLossRecoveryActionRate ?? 0
        return `${(rate * 100).toFixed(2)}%`
      },
    },
    {
      id: 'historicalLossRate',
      label: 'Historical Loss Rate (%)',
      hasData: true, // Available
      defaultVisible: true,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        const rate = data.totalRealisedLossesRate ?? 0
        return `${(rate * 100).toFixed(2)}%`
      },
    },
    {
      id: 'totalRepayments',
      label: 'Total Repayments (Lifetime) ($)',
      hasData: true, // Available
      defaultVisible: true,
      align: 'right',
      width: 114,
      getValue: (row) => {
        const data = 'data' in row ? row.data : row
        if (!data) return '-'
        return formatAmount(data.totalRepaymentsLifetimeAmount ?? 0, {
          maxDecimals: 0,
        })
      },
    },
  ]
}

const CreditRiskMetricsTable: React.FC<CreditRiskMetricsTableProps> = ({
  reportType,
  borrowers,
  aggregated,
}) => {
  const columnDefs = getColumnDefs(reportType)
  const [columnPanelOpen, setColumnPanelOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columnDefs.filter((col) => col.defaultVisible).map((col) => col.id))
  )

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Paginated borrowers (excludes Total/Average rows)
  const paginatedBorrowers = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return borrowers.slice(start, end)
  }, [borrowers, page, rowsPerPage])

  // Create rows with paginated borrowers + totals + averages
  const rows = useMemo(() => {
    const result: (BorrowerData | AggregatedRow)[] = [...paginatedBorrowers]

    // Add Total row
    result.push({
      borrowerId: 'Total',
      isTotal: true,
      data: aggregated.totals as unknown as BorrowerData,
    })

    // Add Average row
    result.push({
      borrowerId: 'Average',
      isTotal: true,
      data: aggregated.averages as unknown as BorrowerData,
    })

    return result
  }, [paginatedBorrowers, aggregated])

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(columnId)) {
        // Don't allow hiding the borrowerId column
        if (columnId !== 'borrowerId') {
          next.delete(columnId)
        }
      } else {
        next.add(columnId)
      }
      return next
    })
  }

  const visibleColumnDefs = columnDefs.filter((col) =>
    visibleColumns.has(col.id)
  )

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: '#28282A',
        boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
        overflow: 'visible',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1,
            letterSpacing: '0.01em',
            color: '#CDA370',
          }}
        >
          Credit Risk Metrics
        </Typography>

        {/* Column selector button */}
        <Box sx={{ position: 'relative' }}>
          <Box
            onClick={() => setColumnPanelOpen(!columnPanelOpen)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              color: '#CDA370',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <ViewColumnIcon sx={{ fontSize: 20 }} />
            <Typography
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 600,
                fontSize: 14,
                color: '#CDA370',
              }}
            >
              View More Data
            </Typography>
          </Box>

          {/* Column selector panel */}
          {columnPanelOpen && (
            <ClickAwayListener onClickAway={() => setColumnPanelOpen(false)}>
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  mt: 1,
                  width: 435,
                  maxHeight: 509,
                  overflowY: 'auto',
                  bgcolor: '#C4996C',
                  borderRadius: '24px',
                  p: 1.5,
                  boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.1)',
                  zIndex: 10,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                  }}
                >
                  {columnDefs
                    .filter((col) => col.id !== 'borrowerId')
                    .map((col, index, arr) => (
                      <Box key={col.id}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 1.5,
                            py: 0.75,
                            gap: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'rgba(40, 40, 42, 0.1)',
                            },
                          }}
                          onClick={() => toggleColumn(col.id)}
                        >
                          <Checkbox
                            checked={visibleColumns.has(col.id)}
                            sx={{
                              p: 0,
                              width: 24,
                              height: 24,
                              '& .MuiSvgIcon-root': {
                                fontSize: 24,
                              },
                              color: '#FFFFFF',
                              '&.Mui-checked': {
                                color: '#28282A',
                              },
                            }}
                          />
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              flexGrow: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: '"Open Sans", sans-serif',
                                fontSize: 14,
                                lineHeight: '150%',
                                color: '#28282A',
                              }}
                            >
                              {col.label}
                            </Typography>
                            {!col.hasData && (
                              <Typography
                                sx={{
                                  fontFamily: '"Open Sans", sans-serif',
                                  fontWeight: 600,
                                  fontSize: 10,
                                  color: '#FF9921',
                                  bgcolor: 'rgba(255, 153, 33, 0.2)',
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                }}
                              >
                                N/A
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {index < arr.length - 1 && (
                          <Box
                            sx={{
                              height: 1,
                              background:
                                'repeating-linear-gradient(to right, #28282A 0, #28282A 4px, transparent 4px, transparent 8px)',
                            }}
                          />
                        )}
                      </Box>
                    ))}
                </Box>
              </Box>
            </ClickAwayListener>
          )}
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2 }}>
        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-root': {
                    py: 3,
                    px: 2,
                    borderBottom: 'none',
                    verticalAlign: 'top',
                  },
                }}
              >
                {visibleColumnDefs.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    sx={{ width: col.width, minWidth: col.minWidth }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems:
                          col.align === 'right' ? 'flex-end' : 'flex-start',
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant='baseSmBold'
                        color='text.primary'
                        sx={{ textAlign: col.align }}
                      >
                        {col.label}
                      </Typography>
                      {!col.hasData && col.id !== 'borrowerId' && (
                        <Typography
                          sx={{
                            fontFamily: '"Open Sans", sans-serif',
                            fontWeight: 600,
                            fontSize: 10,
                            color: '#FF9921',
                            bgcolor: 'rgba(255, 153, 33, 0.2)',
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                          }}
                        >
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const isAggregated = 'isTotal' in row
                return (
                  <TableRow
                    key={index}
                    sx={{
                      bgcolor: isAggregated ? '#F4F4F4' : 'transparent',
                      '& .MuiTableCell-root': {
                        py: 2,
                        px: 2,
                        borderBottom: '1px dotted #E0E0E0',
                      },
                    }}
                  >
                    {visibleColumnDefs.map((col) => (
                      <TableCell key={col.id} align={col.align}>
                        <Typography
                          variant='baseSm'
                          color='text.primary'
                          fontWeight={
                            isAggregated && col.id === 'borrowerId' ? 600 : 400
                          }
                        >
                          {col.getValue(row)}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {borrowers.length > ROWS_PER_PAGE_OPTIONS[0] && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <TablePagination
              component='div'
              count={borrowers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage='Rows per page:'
              slotProps={{
                select: {
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        bgcolor: '#FFFFFF',
                        '& .MuiMenuItem-root': {
                          color: '#28282A',
                          fontSize: 14,
                          '&:hover': {
                            bgcolor: 'rgba(205, 163, 112, 0.1)',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(205, 163, 112, 0.2)',
                            '&:hover': {
                              bgcolor: 'rgba(205, 163, 112, 0.3)',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              }}
              sx={{
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows':
                  {
                    fontFamily: '"Open Sans", sans-serif',
                    fontSize: 12,
                  },
              }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default CreditRiskMetricsTable
