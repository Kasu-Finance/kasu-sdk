import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomModal from '@/components/molecules/CustomModal'
import HorizontalStepper from '@/components/molecules/HorizontalStepper'
import NumericalInput from '@/components/molecules/NumericalInput'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ExitIcon } from '@/assets/icons'

interface WithdrawModalProps {
  pool: any
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ pool }) => {
  const [amount, setAmount] = useState<string>('')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const router = useRouter()
  const { t } = useTranslation()

  const steps = ['Request', 'Approve', 'Confirm']

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
      <Box mt={3} width='100%'>
        <HorizontalStepper steps={steps} />
      </Box>

      <Box mt={3}>
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
              startAdornment: <ExitIcon />,
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
      </Box>
    </CustomModal>
  )
}

export default WithdrawModal
