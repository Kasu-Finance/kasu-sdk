import { Typography } from '@mui/material'

const LendingLoyalityLevelsTooltip = ({ loyalityLevel = 0 }) => {
  return (
    <>
      {loyalityLevel === 0 && (
        <>
          <Typography variant='inherit'>
            The value of your rKSU balance, relative to your total current and
            pending USDC lending across all Lending Strategies, is less than 1%.
            Consequently, you will be ranked behind Loyalty Level 1 and 2
            Lenders in the queue for lending access priority and lending
            withdrawal priority to and from Lending Strategies. Additionally,
            you will not be eligible for any bonus APY (excluding you from
            earning bonus interest).
          </Typography>
          <br />
          <Typography variant='inherit'>
            You can achieve Loyalty Level 1 or 2, along with the associated
            token utility and benefits, as follows:
          </Typography>
          <br />
          <b>Loyalty Level 1</b> <br />
          If the value of your rKSU balance relative to your total current and
          pending USDC lending across all Lending Strategies is 1% or greater,
          but less than 5%, you will achieve Loyalty Level 1, entitling you to
          the following token utility and benefits:
          <ul>
            <li>
              Second order priority access to Lending Strategies and loan
              Tranches (behind Loyalty Level 2).
            </li>
            <li>
              Second order priority for capital withdrawals from your existing
              lending (behind Loyalty Level 2).
            </li>
            <li>
              Additional APY (APY Bonus) awarding you with bonus interest
              earnings on all your lending, awarded in KSU (subject to change
              according to liquidity demand and supply requirements).
            </li>
          </ul>
          <br />
          <b>Loyalty Level 2 </b>
          <br />
          If the value of your rKSU balance relative to your total current and
          pending USDC lending across all Lending Strategies is 5% or greater,
          you will achieve Loyalty Level 2, entitling you to the following token
          utility and benefits:
          <ul>
            <li>
              First order priority access to Lending Strategies and loan
              Tranches.
            </li>
            <li>
              First order priority for capital withdrawals from your existing
              lending.
            </li>
            <li>
              Additional APY (more APY Bonus than Loyalty Level 1 Token Lockers)
              awarding you with bonus interest earnings on all your lending,
              awarded in KSU (subject to change according to liquidity demand
              and supply requirements).
            </li>
          </ul>
        </>
      )}
      {loyalityLevel === 1 && (
        <>
          <Typography variant='inherit'>
            The value of your rKSU balance, relative to your total current and
            pending USDC lending across all Lending Strategies, is 1% or
            greater, but less than 5%. This entitles you to Loyalty Level 1
            token utility and benefits as follows:
          </Typography>
          <br />
          <b>Loyalty Level 1</b> <br />
          <ul>
            <li>
              Second order priority access to Lending Strategies and loan
              Tranches (behind Loyalty Level 2).
            </li>
            <li>
              Second order priority for capital withdrawals from your existing
              lending (behind Loyalty Level 2).
            </li>
            <li>
              Additional APY (APY Bonus) awarding you with bonus interest
              earnings on all your lending, awarded in KSU (subject to change
              according to liquidity demand and supply requirements).
            </li>
          </ul>
          <Typography variant='inherit'>
            You can achieve Loyalty Level 2, along with the associated token
            utility and benefits, as follows:
          </Typography>
          <br />
          <b>Loyalty Level 2 </b>
          <br />
          If the value of your rKSU balance relative to your total current and
          pending USDC lending across all Lending Strategies is 5% or greater,
          you will achieve Loyalty Level 2, entitling you to the following token
          utility and benefits as follows:
          <ul>
            <li>
              First order priority access to Lending Strategies and loan
              Tranches.
            </li>
            <li>
              First order priority for capital withdrawals from your existing
              lending.
            </li>
            <li>
              Additional APY (more APY Bonus than Loyalty Level 1 Token Lockers)
              awarding you with bonus interest earnings on all your lending,
              awarded in KSU (subject to change according to liquidity demand
              and supply requirements).
            </li>
          </ul>
          <Typography variant='inherit'>
            Should you unlock any amount of KSU, your rKSU will be burned in
            relative proportion. This may adversely affect your Loyalty Level,
            which in turn, adversely affects your access to Lending Strategies
            and loan Tranches, along with your position in the queue for
            withdrawals from your existing lending. It may also affect your APY
            bonus. It will also reduce your share of Protocol Fees, regardless
            of Loyalty Level.
            <br />
            Regardless of your Loyalty Level, your rKSU balance, relative to the
            total combined rKSU balance of all Lenders in the Kasu ecosystem,
            also determines your share of Protocol Fees.
          </Typography>
        </>
      )}
      {loyalityLevel === 2 && (
        <>
          <Typography variant='inherit'>
            The value of your rKSU balance, relative to your total current and
            pending USDC lending across all Lending Strategies, is 5% or
            greater. This entitles you to Loyalty Level 2 token utility and
            benefits as follows:
          </Typography>
          <br />
          <b>Loyalty Level 2 </b>
          <br />
          <ul>
            <li>
              First order priority access to Lending Strategies and loan
              Tranches.
            </li>
            <li>
              First order priority for capital withdrawals from your existing
              lending.
            </li>
            <li>
              Additional APY (more APY Bonus than Loyalty Level 1 Token Lockers)
              awarding you with bonus interest earnings on all your lending,
              awarded in KSU (subject to change according to liquidity demand
              and supply requirements).
            </li>
          </ul>
          <Typography variant='inherit'>
            Should you unlock any amount of KSU, your rKSU will be burned in
            relative proportion. This may adversely affect your Loyalty Level,
            which in turn, adversely affects your access to Lending Strategies
            and loan Tranches, along with your position in the queue for
            withdrawals from your existing lending. It may also affect your APY
            bonus. It will also reduce your share of Protocol Fees, regardless
            of Loyalty Level.
            <br />
            Regardless of your Loyalty Level, your rKSU balance, relative to the
            total combined rKSU balance of all Lenders in the Kasu ecosystem,
            also determines your share of Protocol Fees.
          </Typography>
        </>
      )}
    </>
  )
}

export default LendingLoyalityLevelsTooltip
