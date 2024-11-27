import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'
import { PortfolioTranche } from '@solidant/kasu-sdk/src/services/Portfolio/types'

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

const mapFixedLoanToConfig = (
  fixedLoans: PortfolioTranche['fixedLoans'],
  fixedTermConfig: TrancheData['fixedTermConfig']
) => {
  const fixLoanMap = new Map<string, FixLoan>()

  for (const loan of fixedLoans) {
    const item = fixLoanMap.get(loan.configId)

    if (item) {
      fixLoanMap.set(loan.configId, {
        investedAmount: item.investedAmount + parseFloat(loan.amount),
        lastEpochYield:
          item.lastEpochYield + parseFloat(loan.yieldEarnings.lastEpoch),
        lifetimeYield:
          item.lifetimeYield + parseFloat(loan.yieldEarnings.lifetime),
      })

      continue
    }

    fixLoanMap.set(loan.configId, {
      investedAmount: parseFloat(loan.amount),
      lastEpochYield: parseFloat(loan.yieldEarnings.lastEpoch),
      lifetimeYield: parseFloat(loan.yieldEarnings.lifetime),
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
