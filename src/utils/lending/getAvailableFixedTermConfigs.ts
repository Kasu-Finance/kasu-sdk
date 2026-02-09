import { TrancheData } from '@kasufinance/kasu-sdk'

const getAvailableFixedTermConfigs = (
  tranche: TrancheData | undefined,
  address?: string
) => {
  if (!tranche) return []

  return tranche.fixedTermConfig.filter(
    (fixedTermConfig) =>
      fixedTermConfig.fixedTermDepositStatus === 'Everyone' ||
      fixedTermConfig.fixedTermDepositAllowlist.find(
        (allowList) => allowList.userId.toLowerCase() === address?.toLowerCase()
      )
  )
}

export default getAvailableFixedTermConfigs
