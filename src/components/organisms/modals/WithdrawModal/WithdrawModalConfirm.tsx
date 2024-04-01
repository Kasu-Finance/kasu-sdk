import { Box, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import { formatAccount } from '@/utils'

interface ConfirmContentProps {
  amount: string
  poolData: PoolOverview
}

const ConfirmContent: React.FC<ConfirmContentProps> = ({ poolData }) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { amount, selectedTranche } = useWithdrawModalState()

  const userAddress = useMemo(() => formatAccount(account), [account])
  const tranche = useMemo(
    () => poolData?.tranches.find((_) => _.id === selectedTranche),
    [poolData, selectedTranche]
  )
  const poolName = poolData?.poolName || ''

  return (
    <Box width='100%' mt={3}>
      {/* Withdrawal Information Section */}
      <Typography variant='subtitle2'>
        {t('lending.withdraw.confirmStep.withdrawInfo')}
      </Typography>
      <Typography variant='subtitle2'>
        <b>• {amount} KSU •</b> {t('lending.withdraw.confirmStep.amountLabel')}
      </Typography>

      {/* Pool and Tranche Information */}
      <Typography variant='subtitle2' ml={1.5}>
        from <b>{poolName} </b>
      </Typography>
      <Typography variant='body2' fontSize={12} mt={-0.5} ml={1.5}>
        {t('lending.withdraw.confirmStep.subjectLiquidity')}
      </Typography>
      <Typography variant='subtitle2' ml={1.5}>
        Tranche <b>• {tranche?.name}</b>
      </Typography>

      {/*Token amount and User Address */}
      <Typography variant='subtitle2'>
        <b>• {amount} KSU •</b>{' '}
        {t('lending.withdraw.confirmStep.depositedLabel')}
        <b style={{ textTransform: 'uppercase' }}> {userAddress}</b>
      </Typography>
      <Typography variant='body2' fontSize={12} mt={-0.5} ml={1.5}>
        {t('lending.withdraw.confirmStep.subjectLiquidity')}
      </Typography>
    </Box>
  )
}

export default ConfirmContent
