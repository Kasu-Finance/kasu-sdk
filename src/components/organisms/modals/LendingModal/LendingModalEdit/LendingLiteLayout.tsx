import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { Dispatch, memo, SetStateAction, useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import DepositAmountInput from '@/components/molecules/lending/lendingModal/DepositAmountInput'
import PoolDropdown from '@/components/molecules/lending/PoolDropdown'
import Acknowledgement from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'
import ApyDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/ApyDropdown'
import ForecastedEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/ForecastedEarnings'
import LendingModalEditActions from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingModalEditActions'
import LendingTrancheDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingTrancheDropdown'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'
import getAvailableFixedTermConfigs from '@/utils/lending/getAvailableFixedTermConfigs'

type LiteLayoutProps = {
  selectedPool: string
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
  setSelectedPool: Dispatch<SetStateAction<string>>
  setAmount: Dispatch<SetStateAction<string>>
  setAmountInUSD: Dispatch<SetStateAction<string | undefined>>
  handlePoolChange: (pool: PoolOverview) => void
  handleTrancheChange: (
    tranche: `0x${string}`,
    defaultFixedTermConfigId: string | undefined
  ) => void
  handleFixedTermConfigChange: (fixedTermConfigId: string | undefined) => void
  validate: (
    amount: string,
    amountInUSD?: string | undefined,
    depositMinMax?:
      | {
          minDeposit: string
          maxDeposit: string
          remainingCapacity?: string
          epochMaxDeposit?: string
        }
      | undefined,
    trancheId?: `0x${string}`
  ) => void
}

const LendingLiteLayout: React.FC<LiteLayoutProps> = ({
  selectedPool,
  selectedToken,
  supportedTokens,
  usdcBalance,
  usdcDecimals,
  amount,
  deferredAmount,
  amountInUSD,
  deferredAmountInUSD,
  selectedTranche,
  fixedTermConfigId,
  setAmount,
  setAmountInUSD,
  validate,
  handlePoolChange,
  handleTrancheChange,
  handleFixedTermConfigChange,
}) => {
  const { modal } = useModalState()
  const { address } = usePrivyAuthenticated()

  const { pools, pool: defaultPool } = modal[ModalsKeys.LEND]

  const selectedPoolData =
    pools?.find((pool) => pool.id === selectedPool) ?? defaultPool

  const selectedTrancheData = selectedPoolData?.tranches.find(
    (tranche) => tranche.id === selectedTranche
  )

  const hasFixedTermOptions = useMemo(
    () => getAvailableFixedTermConfigs(selectedTrancheData, address).length > 0,
    [address, selectedTrancheData]
  )

  return (
    <Stack spacing={3} mt={3}>
      {pools && (
        <PoolDropdown
          selectedPool={selectedPool}
          handlePoolChange={handlePoolChange}
          pools={pools}
        />
      )}
      <LendingTrancheDropdown
        selectedPool={selectedPool}
        selectedTranche={selectedTranche}
        setSelectedTranche={handleTrancheChange}
        showApy={!hasFixedTermOptions}
      />
      {hasFixedTermOptions && (
        <ApyDropdown
          fixedTermConfigId={fixedTermConfigId}
          selectedTrancheId={selectedTranche}
          selectedPoolId={selectedPool}
          setFixedTermConfigId={handleFixedTermConfigChange}
        />
      )}
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
      <ForecastedEarnings
        amountInUSD={deferredAmountInUSD ?? deferredAmount}
        selectedPool={selectedPool}
        selectedTranche={selectedTranche}
      />
      <Acknowledgement />
      <LendingModalEditActions
        amount={deferredAmount}
        amountInUSD={deferredAmountInUSD}
        fixedTermConfigId={fixedTermConfigId}
        trancheId={selectedTranche}
        selectedToken={selectedToken}
        selectedPool={selectedPool}
      />
    </Stack>
  )
}

export default memo(LendingLiteLayout)
