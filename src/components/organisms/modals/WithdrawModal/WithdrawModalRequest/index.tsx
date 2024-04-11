import { Box, Typography } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import React from 'react'

import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import WithdrawAmountInput from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/WithdrawAmountInput'
import WithdrawTrancheSelect from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/WithdrawTrancheSelect'

interface WithdrawModalRequestProps {
  poolData: PoolOverview
  balance: string
  isMultiTranche: boolean
  containerClassName?: string
}

const WithdrawModalRequest: React.FC<WithdrawModalRequestProps> = ({
  poolData,
  balance,
  isMultiTranche,
  containerClassName,
}) => {
  const { t } = useTranslation()
  const { amount, setAmount } = useWithdrawModalState()

  return (
    <Box pt={3} pl={1} pr={1} className={containerClassName}>
      <Typography variant='subtitle1' mb={2}>
        {t('lending.withdraw.subtitle')}
      </Typography>

      <WithdrawAmountInput
        balance={balance}
        amount={amount}
        setAmount={setAmount}
      />

      {isMultiTranche && <WithdrawTrancheSelect poolData={poolData} />}
    </Box>
  )
}

export default WithdrawModalRequest
