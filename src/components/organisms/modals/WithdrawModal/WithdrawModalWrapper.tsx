import React from 'react'

import WithdrawModal from '@/components/organisms/modals/WithdrawModal'

import WithdrawModalProvider from '@/context/withdrawModal/withdrawModal.provider'

interface WithdrawModalWrapperProps {
  handleClose: () => void
}

const WithdrawModalWrapper: React.FC<WithdrawModalWrapperProps> = ({
  handleClose,
}) => {
  return (
    <WithdrawModalProvider>
      <WithdrawModal handleClose={handleClose} />
    </WithdrawModalProvider>
  )
}

export default WithdrawModalWrapper
