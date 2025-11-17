import { TrancheData } from '@kasufinance/kasu-sdk/src/services/DataService/types'

const sortTranches = (tranches: TrancheData[]) => {
  if (!tranches || tranches.length === 0) {
    return []
  }
  const tranchePriority = {
    Senior: 1,
    Mezzanine: 2,
    Junior: 3,
  }

  return tranches.slice().sort((a, b) => {
    const priorityA =
      tranchePriority[a.name as keyof typeof tranchePriority] ||
      Number.MAX_SAFE_INTEGER
    const priorityB =
      tranchePriority[b.name as keyof typeof tranchePriority] ||
      Number.MAX_SAFE_INTEGER
    return priorityA - priorityB
  })
}

export default sortTranches
