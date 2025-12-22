import { Box, Skeleton, Stack, Typography } from '@mui/material'
import React, { Dispatch, memo, SetStateAction } from 'react'

import useModalState from '@/hooks/context/useModalState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import DepositAmountInput from '@/components/molecules/lending/lendingModal/DepositAmountInput'
import Acknowledgement from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'
import ApyDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/ApyDropdown'
import EarningsSimulator from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator'
import LendingModalEditActions from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingModalEditActions'
import LendingTrancheDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingTrancheDropdown'
import SecureSpotInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SecureSpotInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'
import getAvailableFixedTermConfigs from '@/utils/lending/getAvailableFixedTermConfigs'

type ProLayoutProps = {
  amount: string
  amountInUSD: string | undefined
  deferredAmount: string
  deferredAmountInUSD: string | undefined
  selectedToken: SupportedTokens
  selectedTranche: `0x${string}`
  fixedTermConfigId: string | undefined
  supportedTokens: ReturnType<typeof useSupportedTokenInfo>
  usdcBalance: string
  usdcDecimals?: number
  setAmount: Dispatch<SetStateAction<string>>
  setAmountInUSD: Dispatch<SetStateAction<string | undefined>>
  handleTrancheChange: (
    tranche: `0x${string}`,
    defaultFixedTermConfigId: string | undefined
  ) => void
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
  supportedTokens,
  usdcBalance,
  usdcDecimals,
  amount,
  deferredAmount,
  amountInUSD,
  deferredAmountInUSD,
  fixedTermConfigId,
  selectedTranche,
  setAmount,
  setAmountInUSD,
  validate,
  handleFixedTermConfigChange,
  handleTrancheChange,
}) => {
  const { modal } = useModalState()
  const { address } = usePrivyAuthenticated()

  const { pool } = modal[ModalsKeys.LEND]

  const selectedTrancheData = pool.tranches.find(
    (tranche) => tranche.id === selectedTranche
  )

  const hasFixedTermOptions =
    getAvailableFixedTermConfigs(selectedTrancheData, address).length > 0

  return (
    <Stack spacing={3} mt={3}>
      {!supportedTokens ? (
        <Skeleton
          variant='rounded'
          sx={{ bgcolor: 'gold.extraDark' }}
          height={60}
        />
      ) : (
        <DepositAmountInput
          selectedToken={selectedToken}
          amount={amount}
          amountInUSD={amountInUSD}
          setAmount={setAmount}
          setAmountInUSD={setAmountInUSD}
          balance={usdcBalance}
          decimals={usdcDecimals}
          validate={validate}
          applyConversion={() => {}}
          startAdornment={
            <Box display='flex' alignItems='center'>
              {supportedTokens[SupportedTokens.USDC].icon.dark}
              <Typography
                variant='inherit'
                component='span'
                color='gold.extraDark'
                ml={1}
              >
                {SupportedTokens.USDC}
              </Typography>
            </Box>
          }
          endAdornment={null}
          debounceTime={500}
        />
      )}
      <LendingTrancheDropdown
        selectedTranche={selectedTranche}
        setSelectedTranche={handleTrancheChange}
        showApy={!hasFixedTermOptions}
      />
      {hasFixedTermOptions && (
        <ApyDropdown
          fixedTermConfigId={fixedTermConfigId}
          selectedTrancheId={selectedTranche}
          setFixedTermConfigId={handleFixedTermConfigChange}
        />
      )}
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
