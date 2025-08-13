import { Skeleton, Stack } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { Dispatch, memo, SetStateAction } from 'react'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import Acknowledgement from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'
import ForecastedEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/ForecastedEarnings'
import LendingModalEditActions from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingModalEditActions'
import LendingTrancheDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingTrancheDropdown'
import PoolDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/PoolDropdown'
import SelectedAssetInput from '@/components/organisms/modals/LendingModal/LendingModalEdit/SelectedAssetInput'
import SupportedAssetsDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/SupportedAssetsDropdown'
import TrancheInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/TrancheInfo'

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
  handlePoolChange: (pool: PoolOverview) => void
  handleTrancheChange: (
    tranche: `0x${string}`,
    defaultFixedTermConfigId: string | undefined
  ) => void
  handleTokenChange: (token: SupportedTokens) => void
  handleFixedTermConfigChange: (fixedTermConfigId: string | undefined) => void
  validate: (
    amount: string,
    amountInUSD?: string | undefined,
    depositMinMax?: { minDeposit: string; maxDeposit: string } | undefined,
    token?: SupportedTokens | undefined
  ) => void
}

const LiteLayout: React.FC<LiteLayoutProps> = ({
  selectedPool,
  selectedToken,
  supportedTokenUserBalances,
  supportedTokens,
  amount,
  deferredAmount,
  amountInUSD,
  deferredAmountInUSD,
  isValidating,
  selectedTranche,
  setAmount,
  setAmountInUSD,
  validate,
  setIsValidating,
  handlePoolChange,
  handleApplyConversion,
  handleTrancheChange,
  handleTokenChange,
}) => {
  return (
    <Stack spacing={3} mt={3}>
      <PoolDropdown
        selectedPool={selectedPool}
        handlePoolChange={handlePoolChange}
      />
      <LendingTrancheDropdown
        selectedPool={selectedPool}
        selectedTranche={selectedTranche}
        setSelectedTranche={handleTrancheChange}
      />
      <TrancheInfo
        selectedPool={selectedPool}
        selectedTranche={selectedTranche}
      />
      <SupportedAssetsDropdown
        selectedToken={selectedToken}
        setSelectedToken={handleTokenChange}
      />
      {!supportedTokenUserBalances || !supportedTokens ? (
        <Skeleton
          variant='rounded'
          sx={{ bgcolor: 'gold.extraDark' }}
          height={60}
        />
      ) : (
        <SelectedAssetInput
          validate={validate}
          selectedToken={selectedToken}
          amount={amount}
          setAmount={setAmount}
          amountInUSD={amountInUSD}
          setAmountInUSD={setAmountInUSD}
          isValidating={isValidating}
          setIsValidating={setIsValidating}
          supportedTokenUserBalances={supportedTokenUserBalances}
          supportedTokens={supportedTokens}
          applyConversion={handleApplyConversion}
        />
      )}
      <ForecastedEarnings
        amountInUSD={deferredAmountInUSD ?? deferredAmount}
        selectedPool={selectedPool}
        selectedTranche={selectedTranche}
      />
      <Acknowledgement />
      <LendingModalEditActions
        amount={deferredAmount}
        amountInUSD={deferredAmountInUSD}
        fixedTermConfigId='0'
        trancheId={selectedTranche}
        selectedToken={selectedToken}
        selectedPool={selectedPool}
      />
    </Stack>
  )
}

export default memo(LiteLayout)
