import { Typography } from '@mui/material'

const RksuTooltip = () => {
  return (
    <>
      <Typography variant='inherit'>
        The value of your rKASU balance relative to your total current and
        pending USDC lending across all Lending Strategies. This ratio
        determines your Loyalty Level. Your Loyalty Level determines the extent
        of your token utility (lending access priority and lending withdrawal
        priority to and from Lending Strategies) and associated rewards (APY
        bonus) as follows:
      </Typography>
      <br />
      <Typography variant='inherit'>
        <b>No Loyalty Status</b>
        <br />
        If the value of your rKASU balance relative to your current and pending
        USDC lending is less than 1%:
      </Typography>
      <ul>
        <li>
          No priority access to Lending Strategies and loan Tranches, where you
          will be subject to the normal queuing system after Loyalty Level 1 and
          2 Token Lockers.
        </li>
        <li>
          No priority for capital withdrawals from your existing lending, where
          you will be subject to the normal queuing system after Loyalty Level 1
          and 2 Token Lockers.
        </li>
        <li>
          No additional APY (APY Bonus), excluding you from any bonus interest
          earnings on your lending.
        </li>
      </ul>

      <Typography variant='inherit'>
        <b>Loyalty Level 1</b>
        <br />
        If the value of your rKASU balance relative to your total current and
        pending USDC lending across all Lending Strategies is 1% or greater, but
        less than 5%, you will achieve Loyalty Level 1, entitling you to the
        following token utility and benefits:
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
          Additional APY (APY Bonus) awarding you with bonus interest earnings
          on all your lending, awarded in KASU (subject to change according to
          liquidity demand and supply requirements).
        </li>
      </ul>

      <Typography variant='inherit'>
        <b>Loyalty Level 2</b>
        <br />
        If the value of your rKASU balance relative to your total current and
        pending USDC lending across all Lending Strategies is 5% or greater, you
        will achieve Loyalty Level 2, entitling you to the following token
        utility and benefits:
      </Typography>
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
          awarding you with bonus interest earnings on all your lending, awarded
          in KASU (subject to change according to liquidity demand and supply
          requirements).
        </li>
      </ul>
      <Typography variant='inherit'>
        Regardless of your Loyalty Level, your rKASU balance, relative to the
        total combined rKASU balance of all Lenders in the Kasu ecosystem, also
        determines your share of Protocol Fees.
      </Typography>
    </>
  )
}

export default RksuTooltip
