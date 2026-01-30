import { Grid } from '@mui/material'
import React from 'react'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import SummaryKPICard from '@/components/organisms/lending/RiskReportingTab/SummaryDashboard/SummaryKPICard'

import { formatAmount } from '@/utils'

import type { FundingReportType, SummaryData } from '@/types/riskReporting'

type SummaryDashboardProps = {
  summaryData: SummaryData
  reportType: FundingReportType
}

/**
 * Get KPI labels based on funding/report type
 */
const getKpiLabels = (reportType: FundingReportType) => {
  switch (reportType) {
    case 'taxPay':
      return {
        card1: 'Total Tax Paid',
        card1Tooltip: 'Total amount of tax paid by borrowers',
        card2: 'Total Tax Funding',
        card2Tooltip: 'Total amount of tax funding provided',
      }
    case 'wholeLedger':
      return {
        card1: 'Total WIP & Outstanding Invoices',
        card1Tooltip:
          'Total value of work in progress and outstanding invoices',
        card2: 'Total Current Ledger Funding',
        card2Tooltip: 'Total current ledger funding amount',
      }
    case 'professionalFee':
    default:
      return {
        card1: 'Total Outstanding Invoices',
        card1Tooltip: 'Total value of outstanding invoices',
        card2: 'Total Outstanding Invoices Funded',
        card2Tooltip:
          'Total amount of outstanding invoices that have been funded',
      }
  }
}

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  summaryData,
  reportType,
}) => {
  const labels = getKpiLabels(reportType)

  const kpiData = [
    {
      title: labels.card1,
      value: formatAmount(summaryData.totalWipAndOutstandingInvoicesAmount, {
        minDecimals: 0,
        maxDecimals: 0,
      }),
      unit: 'USDC',
      tooltip: labels.card1Tooltip,
    },
    {
      title: labels.card2,
      value: formatAmount(summaryData.totalCurrentLedgerFundingAmount, {
        minDecimals: 0,
        maxDecimals: 0,
      }),
      unit: 'USDC',
      tooltip: labels.card2Tooltip,
    },
    {
      title: 'Advance Rate',
      value: formatAmount(summaryData.totalAdvanceRate * 100, {
        minDecimals: 2,
        maxDecimals: 2,
      }),
      unit: '%',
      tooltip: 'Advance rate as percentage of invoice value',
    },
    {
      title: 'Current Arrears ($)',
      value: formatAmount(summaryData.currentLoanArrearsAmount, {
        minDecimals: 0,
        maxDecimals: 0,
      }),
      unit: 'USDC',
      tooltip: 'Current loan arrears amount in USDC',
    },
    {
      title: 'Current Arrears (%)',
      value: formatAmount(summaryData.currentLoanArrearsRate * 100, {
        minDecimals: 2,
        maxDecimals: 2,
      }),
      unit: '%',
      tooltip: 'Current loan arrears as percentage of total funding',
    },
    {
      title: 'Historical Loss Rate',
      value: formatAmount(summaryData.historicalLossRate * 100, {
        minDecimals: 2,
        maxDecimals: 2,
      }),
      unit: '%',
      tooltip: 'Historical loss rate as percentage',
    },
  ]

  return (
    <CustomCard>
      <CustomCardHeader title='Summary Dashboard' />
      <CustomInnerCardContent sx={{ py: 3, px: 2 }}>
        {/* KPI Cards - 2 rows of 3 */}
        <Grid container spacing={4}>
          {kpiData.map((kpi, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <SummaryKPICard
                title={kpi.title}
                value={kpi.value}
                unit={kpi.unit}
                tooltip={kpi.tooltip}
              />
            </Grid>
          ))}
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default SummaryDashboard
