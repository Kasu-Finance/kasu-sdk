'use client'

import CustomTable from '@/components/molecules/CustomTable'
import RiskConcentrationsTableBody from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskConcentrationsTable/RiskConcentrationsTableBody'
import RiskConcentrationsTableHeader from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskConcentrationsTable/RiskConcentrationsTableHeader'
import RiskConcentrationsTableFooter from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskConcentrationsTable/RiskConcentrationTableFooter'

const RiskConcentrationsTable = () => (
  <CustomTable
    tableHeader={<RiskConcentrationsTableHeader />}
    tableBody={<RiskConcentrationsTableBody />}
    tableFooter={<RiskConcentrationsTableFooter />}
  />
)

export default RiskConcentrationsTable
