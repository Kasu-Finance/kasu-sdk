const LOYALTY_LEVEL_1 = 1
const LOYALTY_LEVEL_2 = 5

const useLoyaltyLevel = () => {
  const getCurrentLevel = (stakedPercentage: number) => {
    if (stakedPercentage === 0) return undefined

    if (stakedPercentage < LOYALTY_LEVEL_1) return 'LEVEL_0'

    return stakedPercentage >= LOYALTY_LEVEL_2 ? 'LEVEL_2' : 'LEVEL_1'
  }

  return { level_1: LOYALTY_LEVEL_1, level_2: LOYALTY_LEVEL_2, getCurrentLevel }
}

export default useLoyaltyLevel
