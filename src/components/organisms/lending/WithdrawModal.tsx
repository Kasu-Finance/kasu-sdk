import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import CustomModal from '@/components/molecules/CustomModal'
import NumericalInput from '@/components/molecules/NumericalInput'

import { ModalsKeys } from '@/context/modal/modal.types'

import { LockIcon } from '@/assets/icons'

interface WithdrawModalProps {
  pool: any
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ pool }) => {
  const [amount, setAmount] = useState<string>('')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const router = useRouter()

  const handleMax = () => {
    if (pool) {
      setWithdrawAmount(pool?.balance)
    }
  }

  const onClose = () => {
    router.replace('/lending')
  }

  return (
    <CustomModal
      modalKey={ModalsKeys.WITHDRAW}
      title={`Withdraw from ${pool?.poolName || ''}`}
      onClose={onClose}
    >
      <NumericalInput
        amount={amount}
        setAmount={setAmount}
        handleMax={handleMax}
        label='Withdrawal Request Amount'
        rootProps={{
          sx: (theme) => ({
            mt: 1,
          }),
          InputLabelProps: {
            shrink: true,
          },
          InputProps: {
            startAdornment: <LockIcon />,
            endAdornment: 'USDC',
            sx: (theme) => ({
              '& .MuiInputBase-input': {
                px: 1,
              },
              '& svg > path': {
                fill: theme.palette.icon.primary,
              },
            }),
          },
        }}
      />
    </CustomModal>
  )
}

export default WithdrawModal
