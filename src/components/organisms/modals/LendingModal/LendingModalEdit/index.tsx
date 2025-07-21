import { Stack } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'

import Acknowledgement from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'
import ApyDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/ApyDropdown'
import EarningsSimulator from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator'
import LendingModalEditActions from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingModalEditActions'
import LendingTrancheDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingTrancheDropdown'
import SecureSpotInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SecureSpotInfo'
import SelectedAssetInput from '@/components/organisms/modals/LendingModal/LendingModalEdit/SelectedAssetInput'
import SupportedAssetsDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/SupportedAssetsDropdown'
import SwapInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SwapInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'
import { toBigNumber } from '@/utils'

const LendingModalEdit = () => {
  const { modal } = useModalState()

  const { pool } = modal[ModalsKeys.LEND]

  const { setModalStatus } = useModalStatusState()

  const defaultTranche = useMemo(
    () =>
      pool.tranches.find(
        (tranche) => !toBigNumber(tranche.maximumDeposit).isZero()
      ) ?? pool.tranches[0],
    [pool]
  )

  const [isValidating, setIsValidating] = useState(false)
  const [selectedToken, setSelectedToken] = useState(SupportedTokens.USDC)
  const [amount, setAmount] = useState('')
  const [amountInUSD, setAmountInUSD] = useState<string | undefined>(undefined)
  const [selectedTranche, setSelectedTranche] = useState(
    defaultTranche.id as `0x${string}`
  )
  const [fixedTermConfigId, setFixedTermConfigId] = useState(
    defaultTranche.fixedTermConfig.length ? undefined : '0'
  )

  const handleTokenChange = useCallback(
    (token: SupportedTokens) => {
      setModalStatus({ type: 'default' })
      setSelectedToken(token)
    },
    [setModalStatus]
  )

  const handleTrancheChange = useCallback(
    (tranche: `0x${string}`, defaultFixedTermConfigId: string | undefined) => {
      setModalStatus({ type: 'default' })
      setSelectedTranche(tranche)
      setFixedTermConfigId(defaultFixedTermConfigId)
    },
    [setModalStatus]
  )

  return (
    <Stack spacing={3} mt={3}>
      <SupportedAssetsDropdown
        selectedToken={selectedToken}
        setSelectedToken={handleTokenChange}
      />
      <SelectedAssetInput
        selectedToken={selectedToken}
        amount={amount}
        setAmount={setAmount}
        amountInUSD={amountInUSD}
        setAmountInUSD={setAmountInUSD}
        isValidating={isValidating}
        setIsValidating={setIsValidating}
      />
      <SwapInfo
        amount={amount}
        amountInUSD={amountInUSD}
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
        setFixedTermConfigId={setFixedTermConfigId}
      />
      <EarningsSimulator />
      <Acknowledgement />
      <SecureSpotInfo />
      <LendingModalEditActions />
    </Stack>
  )
}

export default LendingModalEdit
