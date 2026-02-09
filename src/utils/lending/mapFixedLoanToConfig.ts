import { PortfolioTranche, TrancheData } from '@kasufinance/kasu-sdk'

type FixLoan = {
  investedAmount: number
  lastEpochYield: number
  lifetimeYield: number
}

type MappedFixedTermConfig = TrancheData['fixedTermConfig'][number] & {
  investedAmount: string
  yieldEarnings: {
    lastEpoch: string
    lifetime: string
  }
}

const toNumber = (value: string) => {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const mapFixedLoanToConfig = (
  fixedLoans: PortfolioTranche['fixedLoans'],
  fixedTermConfig: TrancheData['fixedTermConfig']
) => {
  const fixLoanMap = new Map<string, FixLoan>()

  for (const loan of fixedLoans) {
    const item = fixLoanMap.get(loan.configId)

    if (item) {
      fixLoanMap.set(loan.configId, {
        investedAmount: loan.isLocked
          ? item.investedAmount + toNumber(loan.amount)
          : item.investedAmount,
        lastEpochYield:
          item.lastEpochYield + toNumber(loan.yieldEarnings.lastEpoch),
        lifetimeYield:
          item.lifetimeYield + toNumber(loan.yieldEarnings.lifetime),
      })

      continue
    }

    fixLoanMap.set(loan.configId, {
      investedAmount: loan.isLocked ? toNumber(loan.amount) : 0,
      lastEpochYield: toNumber(loan.yieldEarnings.lastEpoch),
      lifetimeYield: toNumber(loan.yieldEarnings.lifetime),
    })
  }

  const mappedFixedTermConfig: MappedFixedTermConfig[] = []

  for (const config of fixedTermConfig) {
    const fixLoan = fixLoanMap.get(config.configId)

    if (!fixLoan) continue

    mappedFixedTermConfig.push({
      ...config,
      investedAmount: fixLoan.investedAmount.toString(),
      yieldEarnings: {
        lastEpoch: fixLoan.lastEpochYield.toString(),
        lifetime: fixLoan.lifetimeYield.toString(),
      },
    })
  }

  return mappedFixedTermConfig
}

export default mapFixedLoanToConfig
