import React from 'react'

import WithdrawModal from '@/components/organisms/modals/WithdrawModal'

interface WithdrawModalWrapperProps {
  handleClose: () => void
}

const WithdrawModalWrapper: React.FC<WithdrawModalWrapperProps> = ({
  handleClose,
}) => {
  return <WithdrawModal handleClose={handleClose} />
}

export default WithdrawModalWrapper
