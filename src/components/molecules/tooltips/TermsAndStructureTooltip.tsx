import { Typography } from '@mui/material'

const TermsAndStructureTooltip = () => (
  <Typography variant='inherit'>
    The term and structure offered to Lenders, which typically matches the
    requirements of this Lending Strategy to suit the lending asset class and
    loan structure provided to End Borrowers.
    <br />
    <br />
    Open Ended means that the Lending Strategy is ongoing with no defined end
    date on which Lenders will be repaid. This is because the Lending Strategy
    facilitates Revolving Loans to End Borrowers, which also have no defined end
    date. Such loans are typically utilised to fund ongoing operations (akin to
    a Line of Credit, Working Capital Loan or Evergreen Facility). Lenders must
    therefore submit withdrawal requests to access any capital return.
    <br />
    <br />
    Term Loan means that there is a defined end date on which Lenders will, in
    the ordinary course, be fully repaid. This may, or may not, also include
    scheduled principal repayments throughout the term of the loan. Whilst
    repayment(s) occur without the need to submit withdrawal requests, the
    repayment profile is pre-defined, with little to no flexibility to submit
    ad-hoc withdrawal requests. This is because Term Loans are typically used to
    fund longer duration assets, such as capital expenditure or long term
    projects (such as property).
  </Typography>
)

export default TermsAndStructureTooltip
