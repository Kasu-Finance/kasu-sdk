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
  TableRow,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'

import { formatAmount } from '@/utils'

import type { FundingReportType } from '@/types/riskReporting'

type DTIConcentrationTableProps = {
  reportType: FundingReportType
}

// Risk level colors from Figma
const RISK_COLORS = {
  low: '#B9DA35', // Green
  moderate: '#FFDC22', // Yellow
  high: '#FF9921', // Orange
  critical: '#F1431C', // Red
}

type RiskLevel = keyof typeof RISK_COLORS

type MockRow = {
  dtiRange: string
  totalFunding: number
  loansOutstanding: number
  dtiPercent: number
  taxesFundedPercent: number
  concentrationRisk: number
  riskLevel: RiskLevel
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
  getValue: (row: MockRow) => React.ReactNode
}

// Mock data - to be replaced with real data when available
const MOCK_DATA: MockRow[] = [
  {
    dtiRange: '0% - 10%',
    totalFunding: 10500000,
    loansOutstanding: 1000000,
    dtiPercent: 9,
    taxesFundedPercent: 100,
    concentrationRisk: 0.12,
    riskLevel: 'low',
  },
  {
    dtiRange: '10% - 20%',
    totalFunding: 10500000,
    loansOutstanding: 1000000,
    dtiPercent: 9,
    taxesFundedPercent: 100,
    concentrationRisk: 0.12,
    riskLevel: 'moderate',
  },
  {
    dtiRange: '20% - 30%',
    totalFunding: 10500000,
    loansOutstanding: 1000000,
    dtiPercent: 9,
    taxesFundedPercent: 100,
    concentrationRisk: 0.12,
    riskLevel: 'high',
  },
  {
    dtiRange: '30% - 40%',
    totalFunding: 10500000,
    loansOutstanding: 1000000,
    dtiPercent: 9,
    taxesFundedPercent: 100,
    concentrationRisk: 0.12,
    riskLevel: 'critical',
  },
  {
    dtiRange: '40%+',
    totalFunding: 10500000,
    loansOutstanding: 1000000,
    dtiPercent: 9,
    taxesFundedPercent: 100,
    concentrationRisk: 0.12,
    riskLevel: 'low',
  },
]

/**
 * Get column definitions based on funding type
 */
const getColumnDefs = (reportType: FundingReportType): ColumnDef[] => {
  const isTaxPay = reportType === 'taxPay'
  const isWholeLedger = reportType === 'wholeLedger'

  return [
    {
      id: 'dtiRange',
      label: 'DTI Range',
      hasData: false, // Missing data
      defaultVisible: true,
      align: 'left',
      width: 120,
      minWidth: 120,
      getValue: (row) => row.dtiRange,
    },
    {
      id: 'totalFunding',
      label: isTaxPay
        ? 'Total Tax Funding'
        : isWholeLedger
          ? 'Total Ledger Funding'
          : 'Total Invoice Funding',
      hasData: false, // Missing data
      defaultVisible: true,
      align: 'right',
      getValue: (row) => formatAmount(row.totalFunding, { maxDecimals: 0 }),
    },
    {
      id: 'loansOutstanding',
      label: isTaxPay
        ? 'Tax Pay Loans Outstanding ($)'
        : isWholeLedger
          ? 'Loans Outstanding ($)'
          : 'Invoices Outstanding ($)',
      hasData: false, // Missing data
      defaultVisible: true,
      align: 'right',
      width: 177,
      getValue: (row) => formatAmount(row.loansOutstanding, { maxDecimals: 0 }),
    },
    {
      id: 'dtiPercent',
      label: 'DTI (%)',
      hasData: false, // Missing data
      defaultVisible: true,
      align: 'right',
      getValue: (row) => `${row.dtiPercent}%`,
    },
    {
      id: 'taxesFundedPercent',
      label: isTaxPay
        ? '% Taxes Funded'
        : isWholeLedger
          ? '% Funded'
          : '% Invoices Funded',
      hasData: false, // Missing data
      defaultVisible: true,
      align: 'right',
      getValue: (row) => `${row.taxesFundedPercent}%`,
    },
    {
      id: 'concentrationRisk',
      label: 'DTI+Exposure Weighted Concentration Risk (%)',
      hasData: false, // Missing data
      defaultVisible: true,
      align: 'left',
      width: 276,
      getValue: (row) => (
        <Box display='flex' alignItems='center' gap={2} position='relative'>
          {/* Risk indicator bar */}
          <Box
            sx={{
              position: 'absolute',
              left: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 9,
              height: 42,
              bgcolor: RISK_COLORS[row.riskLevel],
              borderRadius: '2px',
            }}
          />
          <Typography variant='baseSm' sx={{ pl: 2 }}>
            {row.concentrationRisk.toFixed(2)}%
          </Typography>
        </Box>
      ),
    },
  ]
}

const DTIConcentrationTable: React.FC<DTIConcentrationTableProps> = ({
  reportType,
}) => {
  const columnDefs = getColumnDefs(reportType)
  const [columnPanelOpen, setColumnPanelOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columnDefs.filter((col) => col.defaultVisible).map((col) => col.id))
  )

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(columnId)) {
        // Don't allow hiding the dtiRange column
        if (columnId !== 'dtiRange') {
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
        bgcolor: '#FFFFFF',
        boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
        overflow: 'visible',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#28282A',
          px: 2,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '8px 8px 0 0',
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
          Debt to Income (DTI) + Exposure Weighted Concentration Risk
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
                    .filter((col) => col.id !== 'dtiRange')
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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                '& .MuiTableCell-root': {
                  py: 3,
                  px: 2,
                  borderBottom: 'none',
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
                    <Typography variant='baseSmBold' color='text.primary'>
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
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_DATA.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  '& .MuiTableCell-root': {
                    py: 2,
                    px: 2,
                    borderBottom: '1px dotted #E0E0E0',
                  },
                  position: 'relative',
                }}
              >
                {visibleColumnDefs.map((col) => (
                  <TableCell key={col.id} align={col.align}>
                    {typeof col.getValue(row) === 'string' ? (
                      <Typography variant='baseSm' color='text.primary'>
                        {col.getValue(row)}
                      </Typography>
                    ) : (
                      col.getValue(row)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default DTIConcentrationTable
