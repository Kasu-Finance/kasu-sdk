import { Stack } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import LendingTrancheDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingTrancheDropdown'
import PoolDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/PoolDropdown'

import { SupportedTokens } from '@/constants/tokens'

type LiteLayoutProps = {
  selectedPool: string
  amount: string
  amountInUSD: string | undefined
  deferredAmount: string
  deferredAmountInUSD: string | undefined
  isValidating: boolean
  selectedToken: SupportedTokens
  selectedTranche: `0x${string}`
  fixedTermConfigId: string | undefined
  supportedTokenUserBalances: ReturnType<
    typeof useSupportedTokenUserBalances
  >['supportedTokenUserBalances']
  supportedTokens: ReturnType<typeof useSupportedTokenInfo>
  setSelectedPool: Dispatch<SetStateAction<string>>
  setAmount: Dispatch<SetStateAction<string>>
  setAmountInUSD: Dispatch<SetStateAction<string | undefined>>
  setIsValidating: Dispatch<SetStateAction<boolean>>
  handleApplyConversion: (
    fromAmount: string,
    token: SupportedTokens
  ) => Promise<void>
  handleTrancheChange: (
    tranche: `0x${string}`,
    defaultFixedTermConfigId: string | undefined
  ) => void
  handleTokenChange: (token: SupportedTokens) => void
  handleFixedTermConfigChange: (fixedTermConfigId: string | undefined) => void
  validate: (
    amount: string,
    amountInUSD?: string | undefined,
    depositMinMax?:
      | {
          minDeposit: string
          maxDeposit: string
        }
      | undefined,
    token?: SupportedTokens | undefined
  ) => void
}

const LiteLayout: React.FC<LiteLayoutProps> = ({
  selectedPool,
  selectedTranche,
  setSelectedPool,
  handleTrancheChange,
}) => {
  return (
    <Stack spacing={3} mt={3}>
      <PoolDropdown
        selectedPool={selectedPool}
        setSelectedPool={setSelectedPool}
      />
      <LendingTrancheDropdown
        selectedTranche={selectedTranche}
        setSelectedTranche={handleTrancheChange}
      />
    </Stack>
  )
}

export default LiteLayout
