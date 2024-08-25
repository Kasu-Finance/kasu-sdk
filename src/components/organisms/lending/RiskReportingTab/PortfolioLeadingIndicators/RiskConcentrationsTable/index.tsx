'use client'

import CustomTableTest from '@/components/molecules/CustomTableTest'
import RiskConcentrationsTableBody from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskConcentrationsTable/RiskConcentrationsTableBody'
import RiskConcentrationsTableHeader from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskConcentrationsTable/RiskConcentrationsTableHeader'
import RiskConcentrationsTableFooter from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskConcentrationsTable/RiskConcentrationTableFooter'

const RiskConcentrationsTable = () => (
  <CustomTableTest
    tableHeader={<RiskConcentrationsTableHeader />}
    tableBody={<RiskConcentrationsTableBody />}
    tableFooter={<RiskConcentrationsTableFooter />}
  />
)

export default RiskConcentrationsTable
