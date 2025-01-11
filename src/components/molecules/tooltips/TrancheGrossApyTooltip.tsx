import { Typography } from '@mui/material'

const TrancheGrossApyTooltip = () => {
  return (
    <>
      <Typography variant='inherit'>
        Gross Annual Percentage Yield (APY) reflects the expected interest rate
        earned by Lenders on an annualised basis, prior to Kasu protocol fees
        being deducted, assuming all repayments will be made as expected. This
        does not account for the additional amount earned from compound
        interest, which accrues every Epoch (every seven days).
        <br />
        <br />
        Kasu protocol fees comprise 10% of interest earned by Lenders. For
        example, if the Gross APY is stated as 15%, then the Net APY earned by
        Lenders is 13.50% after 1.50% is deducted for fees (i.e. 10% x 15% =
        1.5%). Half of this fee is to fund Protocol Fee Sharing for Lenders who
        are also KSU Token Lockers. The remaining half of this fee is retained
        by the Kasu protocol to fund operations.
      </Typography>
    </>
  )
}

export default TrancheGrossApyTooltip
