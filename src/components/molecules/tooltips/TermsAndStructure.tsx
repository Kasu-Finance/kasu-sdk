import { Typography } from '@mui/material'

import UnorderedList from '@/components/atoms/UnorderedList'

const TermsAndStructureTooltip = () => (
  <>
    <Typography variant='inherit'>
      The term and structure offered to Lenders, which typically matches the
      requirements of this Lending Strategy to suit the lending asset class and
      loan structure provided to end borrowers.
    </Typography>
    <UnorderedList>
      <li>
        Open Ended means that the Lending Strategy is ongoing with no defined
        end date upon which Lenders will be repaid. This is because the Lending
        Strategy facilitates Revolving Loans to end borrowers, which also have
        no defined end date. Such loans are typically utilised to fund ongoing
        operations (akin to a Line of Credit, Working Capital Loan or Evergreen
        Facility). Lenders must therefore submit withdrawal requests to access
        any capital return.
      </li>
      <li>
        Term Loan means that there is a defined end date upon which Lenders will
        be fully repaid. This may, or may not, also include scheduled principal
        repayments throughout the term of the loan. Whilst repayment(s) occur
        without the need to submit withdrawal requests, the repayment profile is
        pre-defined, with little to no flexibility to submit ad-hoc withdrawal
        requests. This is because Term Loans are typically used to fund longer
        duration assets, such as capital expenditure or long term projects (such
        as property).
      </li>
    </UnorderedList>
  </>
)

export default TermsAndStructureTooltip
