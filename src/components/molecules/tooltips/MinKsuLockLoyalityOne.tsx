import { Typography } from '@mui/material'

const MinKsuLockLoyalityOne = () => {
  return (
    <>
      <Typography variant='inherit'>
        The minimum amount and duration of KSU you must lock to ensure you
        accumulate enough rKSU (per the below slider) relative to your total
        USDC lending (including pending lending) across all Lending Strategies
        to achieve Loyalty Level 1. For example, if the value of your rKSU
        balance relative to your total current and pending USDC lending across
        all Lending Strategies is 1% or greater, but less than 5%, you will
        achieve Loyalty Level 1, entitling you to the following token utility
        and benefits:
      </Typography>
      <ul>
        <li>
          Second order priority access to Lending Strategies and loan Tranches
          (behind Loyalty Level 2).
        </li>
        <li>
          Second order priority for capital withdrawals from your existing
          lending (behind Loyalty Level 2).
        </li>
        <li>
          Additional APY (APY Bonus), awarding you with bonus interest earnings
          on all your lending, awarded in KSU (subject to change according to
          liquidity demand and supply requirements).
        </li>
      </ul>
    </>
  )
}

export default MinKsuLockLoyalityOne
