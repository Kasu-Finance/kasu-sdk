import { Box, Typography } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import React from 'react'

import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import AmountInput from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/AmountInput'
import TrancheSelect from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/TrancheSelect'

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
      <Typography variant='subtitle1' mb={0.5}>
        {t('lending.withdraw.subtitle')}
      </Typography>

      <AmountInput balance={balance} amount={amount} setAmount={setAmount} />

      {isMultiTranche && <TrancheSelect poolData={poolData} />}
    </Box>
  )
}

export default WithdrawModalRequest
