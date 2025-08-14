import { Skeleton, Stack } from '@mui/material'
import React, { Dispatch, memo, SetStateAction } from 'react'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import Acknowledgement from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'
import ApyDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/ApyDropdown'
import EarningsSimulator from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator'
import LendingModalEditActions from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingModalEditActions'
import LendingTrancheDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingTrancheDropdown'
import SecureSpotInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SecureSpotInfo'
import SelectedAssetInput from '@/components/organisms/modals/LendingModal/LendingModalEdit/SelectedAssetInput'
import SupportedAssetsDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/SupportedAssetsDropdown'
import SwapInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SwapInfo'

import { SupportedTokens } from '@/constants/tokens'

type ProLayoutProps = {
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
    depositMinMax?: { minDeposit: string; maxDeposit: string } | undefined,
    token?: SupportedTokens | undefined
  ) => void
}

const LendingProLayout: React.FC<ProLayoutProps> = ({
  selectedToken,
  supportedTokenUserBalances,
  supportedTokens,
  amount,
  deferredAmount,
  amountInUSD,
  deferredAmountInUSD,
  isValidating,
  fixedTermConfigId,
  selectedTranche,
  setAmount,
  setAmountInUSD,
  validate,
  setIsValidating,
  handleApplyConversion,
  handleFixedTermConfigChange,
  handleTrancheChange,
  handleTokenChange,
}) => (
  <Stack spacing={3} mt={3}>
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
    <SwapInfo
      amount={deferredAmount}
      amountInUSD={deferredAmountInUSD}
      selectedToken={selectedToken}
      isValidating={isValidating}
    />
    <LendingTrancheDropdown
      selectedTranche={selectedTranche}
      setSelectedTranche={handleTrancheChange}
    />
    <ApyDropdown
      fixedTermConfigId={fixedTermConfigId}
      selectedTrancheId={selectedTranche}
      setFixedTermConfigId={handleFixedTermConfigChange}
    />
    <EarningsSimulator
      amount={deferredAmount}
      amountInUSD={deferredAmountInUSD}
      trancheId={selectedTranche}
      fixedTermConfigId={fixedTermConfigId}
    />
    <Acknowledgement />
    <SecureSpotInfo />
    <LendingModalEditActions
      amount={deferredAmount}
      amountInUSD={deferredAmountInUSD}
      fixedTermConfigId={fixedTermConfigId}
      trancheId={selectedTranche}
      selectedToken={selectedToken}
    />
  </Stack>
)

export default memo(LendingProLayout)
