import React from 'react'

import useModalState from '@/hooks/context/useModalState'

import WithdrawModal from '@/components/organisms/modals/WithdrawModal'

import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'
import WithdrawModalProvider from '@/context/withdrawModal/withdrawModal.provider'

import { HexString } from '@/types/lending'

interface WithdrawModalWrapperProps {
  handleClose: () => void
}

const WithdrawModalWrapper: React.FC<WithdrawModalWrapperProps> = ({
  handleClose,
}) => {
  const { modal } = useModalState()

  return (
    <WithdrawModalProvider
      defaultTrancheId={
        modal.withdrawModal.poolData.tranches[0].id as HexString
      }
    >
      <ModalStatusState defaultStatus={ModalStatusAction.REQUEST}>
        <WithdrawModal handleClose={handleClose} />
      </ModalStatusState>
    </WithdrawModalProvider>
  )
}

export default WithdrawModalWrapper
