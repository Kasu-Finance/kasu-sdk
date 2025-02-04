import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CustomTable from '@/components/molecules/CustomTable'
import LoanStatusTableBody from '@/components/organisms/lending/RepaymentsTab/LoanStatus/LoanStatusTableBody'
import LoanStatusTableHeader from '@/components/organisms/lending/RepaymentsTab/LoanStatus/LoanStatusTableHeader'

import { customTypography } from '@/themes/typography'

const LoanStatus = () => {
  return (
    <CustomCard>
      <CustomCardHeader title='Loan Status and Repayment History' />
      <CustomInnerCardContent sx={{ p: 0 }}>
        <CustomTable
          tableHeader={<LoanStatusTableHeader />}
          tableBody={<LoanStatusTableBody />}
          sx={{
            '.MuiTableCell-root': {
              ...customTypography.baseSm,
            },
          }}
        />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default LoanStatus
