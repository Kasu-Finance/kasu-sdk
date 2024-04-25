import React, { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'

import WithdrawModal from '@/components/organisms/modals/WithdrawModal'

import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'
import WithdrawModalProvider from '@/context/withdrawModal/withdrawModal.provider'

import { Tranche, ZERO_ADDRESS } from '@/constants/pool'

import { HexString } from '@/types/lending'

interface WithdrawModalWrapperProps {
  handleClose: () => void
}

const WithdrawModalWrapper: React.FC<WithdrawModalWrapperProps> = ({
  handleClose,
}) => {
  const { modal } = useModalState()

  const defaultTrancheId = useMemo(() => {
    const tranches = modal.withdrawModal.poolData.tranches

    if (tranches?.length === 0) return ZERO_ADDRESS

    const defaultTranche =
      tranches.find((tranche) =>
        tranche.name.toLowerCase().includes(Tranche.SENIOR)
      ) ||
      tranches?.find((tranche) =>
        tranche.name.toLowerCase().includes(Tranche.MEZZANINE)
      ) ||
      tranches?.[0]

    return defaultTranche.id
  }, [modal.withdrawModal.poolData])

  return (
    <WithdrawModalProvider defaultTrancheId={defaultTrancheId as HexString}>
      <ModalStatusState defaultStatus={ModalStatusAction.REQUEST}>
        <WithdrawModal handleClose={handleClose} />
      </ModalStatusState>
    </WithdrawModalProvider>
  )
}

export default WithdrawModalWrapper
