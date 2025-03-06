import { Typography } from '@mui/material'

const MinKsuLockLoyalityTwo = () => {
  return (
    <>
      <Typography variant='inherit'>
        The minimum amount and duration of KASU you must lock to ensure you
        accumulate enough rKASU (per the below slider) relative to your total
        USDC lending (including pending lending) across all Lending Strategies
        to achieve Loyalty Level 2. For example, if the value of your rKASU
        balance relative to your total current and pending USDC lending across
        all Lending Strategies is 5% or greater, you will achieve Loyalty Level
        2, entitling you to the following token utility and benefits:
        <ul>
          <li>
            First order priority access to Lending Strategies and loan Tranches.
          </li>
          <li>
            First order priority for capital withdrawals from your existing
            lending.
          </li>
          <li>
            Additional APY (more APY Bonus than Loyalty Level 1 Token Lockers)
            awarding you with bonus interest earned on all your lending, awarded
            in KASU (subject to change according to liquidity demand and supply
            requirements).
          </li>
        </ul>
      </Typography>
    </>
  )
}

export default MinKsuLockLoyalityTwo
