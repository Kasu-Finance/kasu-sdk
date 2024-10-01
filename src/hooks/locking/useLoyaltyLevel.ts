const LOYALTY_LEVEL_1_REQUIREMENT = 1
const LOYALTY_LEVEL_2_REQUIREMENT = 5

export type LoyalLoyaltyLevels = Extract<LoyaltyLevel, 1 | 2>

export type LoyaltyLevel = -1 | 0 | 1 | 2

type useLoyaltyLevelReturnType<T extends number | undefined> = {
  isLoyal: boolean
  level_1: number
  level_2: number
  currentLevel: T extends number ? LoyaltyLevel : undefined
  getCurrentLevel: (stakedPercentage: number) => LoyaltyLevel
}

const getCurrentLevel = (stakedPercentage: number): LoyaltyLevel => {
  if (!stakedPercentage) return -1

  if (stakedPercentage < LOYALTY_LEVEL_1_REQUIREMENT) return 0

  return stakedPercentage >= LOYALTY_LEVEL_2_REQUIREMENT ? 2 : 1
}

function useLoyaltyLevel(
  stakedPercentage: number
): useLoyaltyLevelReturnType<number>
function useLoyaltyLevel(
  stakedPercentage?: undefined
): useLoyaltyLevelReturnType<undefined>

function useLoyaltyLevel(
  stakedPercentage?: number | undefined
): useLoyaltyLevelReturnType<number | undefined> {
  const currentLevel = stakedPercentage
    ? getCurrentLevel(stakedPercentage)
    : undefined

  return {
    isLoyal: currentLevel === 1 || currentLevel === 2,
    level_1: LOYALTY_LEVEL_1_REQUIREMENT,
    level_2: LOYALTY_LEVEL_2_REQUIREMENT,
    currentLevel,
    getCurrentLevel,
  }
}

export default useLoyaltyLevel
