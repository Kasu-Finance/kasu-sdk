import { memo } from 'react'

import useModalState from '@/hooks/context/useModalState'

import TrancheDropdown from '@/components/molecules/lending/TrancheDropdown'

import { ModalsKeys } from '@/context/modal/modal.types'

type LendingTrancheDropdownProps = {
  selectedTranche: `0x${string}`
  setSelectedTranche: (
    tranche: `0x${string}`,
    defaultFixedTermConfigId: string | undefined
  ) => void
}

const LendingTrancheDropdown: React.FC<LendingTrancheDropdownProps> = ({
  selectedTranche,
  setSelectedTranche,
}) => {
  const { modal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

  return (
    <TrancheDropdown
      tranches={pool.tranches}
      selectedTranche={selectedTranche}
      setSelectedTranche={setSelectedTranche}
      disableOversubscribed
    />
  )
}

export default memo(LendingTrancheDropdown)
