import { memo } from 'react'

import useModalState from '@/hooks/context/useModalState'

import TrancheDropdown from '@/components/molecules/lending/TrancheDropdown'

import { ModalsKeys } from '@/context/modal/modal.types'

type LendingTrancheDropdownProps = {
  selectedPool?: string
  selectedTranche: `0x${string}`
  setSelectedTranche: (
    tranche: `0x${string}`,
    defaultFixedTermConfigId: string | undefined
  ) => void
  showApy?: boolean
  isTrancheDisabled?: (trancheId: `0x${string}`) => boolean
}

const LendingTrancheDropdown: React.FC<LendingTrancheDropdownProps> = ({
  selectedPool,
  selectedTranche,
  setSelectedTranche,
  showApy,
  isTrancheDisabled,
}) => {
  const { modal } = useModalState()

  const { pools, pool } = modal[ModalsKeys.LEND]

  const selected = pools?.find((pool) => pool.id === selectedPool)

  return (
    <TrancheDropdown
      tranches={selected?.tranches ?? pool.tranches}
      selectedTranche={selectedTranche}
      setSelectedTranche={setSelectedTranche}
      disableOversubscribed
      showApy={showApy}
      isTrancheDisabled={isTrancheDisabled}
    />
  )
}

export default memo(LendingTrancheDropdown)
