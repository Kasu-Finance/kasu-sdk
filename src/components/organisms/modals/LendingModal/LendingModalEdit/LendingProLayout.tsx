import { Skeleton, Stack, Typography } from '@mui/material'
import React, { Dispatch, memo, SetStateAction } from 'react'

import getTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import type useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import SupportedAssetsDropdown from '@/components/organisms/lending/SupportedAssetsDropdown'
import Acknowledgement from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'
import ApyDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/ApyDropdown'
import EarningsSimulator from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator'
import LendingModalEditActions from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingModalEditActions'
import LendingTrancheDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingTrancheDropdown'
import SecureSpotInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SecureSpotInfo'
import SelectedAssetInput from '@/components/organisms/modals/LendingModal/LendingModalEdit/SelectedAssetInput'
import SwapInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SwapInfo'

import OneInchLogo from '@/assets/logo/OneInchLogo'

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
  refetchSupportedTokenUserBalances: ReturnType<
    typeof useSupportedTokenUserBalances
  >['refetchSupportedTokenUserBalances']
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
  refetchSupportedTokenUserBalances,
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
}) => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3} mt={3}>
      <Stack spacing={2}>
        <Typography
          variant='baseMd'
          display='inline-flex'
          alignItems='center'
          gap={1}
        >
          {t('modals.earningsCalculator.simulatedAmount.metric-1')}{' '}
          {selectedToken !== SupportedTokens.USDC && (
            <>
              {t('modals.earningsCalculator.simulatedAmount.metric-2')}
              <OneInchLogo />
            </>
          )}
        </Typography>
        <SupportedAssetsDropdown
          selectedToken={selectedToken}
          setSelectedToken={handleTokenChange}
        />
      </Stack>
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
          refetchSupportedTokenUserBalances={refetchSupportedTokenUserBalances}
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
}

export default memo(LendingProLayout)
