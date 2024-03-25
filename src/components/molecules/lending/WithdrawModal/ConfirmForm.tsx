import { Box, Button, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import React, { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import { formatAccount } from '@/utils'

interface ConfirmFormProps {
  amount: string
  poolName: string
  trancheName: string
  onSubmit: () => void
}

const ConfirmForm: React.FC<ConfirmFormProps> = ({
  amount,
  poolName,
  trancheName,
  onSubmit,
}) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()

  const userAddress = useMemo(() => formatAccount(account), [account])

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
        Tranche <b>• {trancheName}</b>
      </Typography>

      {/* User Address Display */}
      <Typography variant='subtitle2'>
        <b>• {amount} KSU •</b>{' '}
        {t('lending.withdraw.confirmStep.depositedLabel')}
        <b style={{ textTransform: 'uppercase' }}> {userAddress}</b>
      </Typography>
      <Typography variant='body2' fontSize={12} mt={-0.5} ml={1.5}>
        {t('lending.withdraw.confirmStep.subjectLiquidity')}
      </Typography>

      {/* Action Button */}
      <Box display='flex' justifyContent='center' width='100%' mt={3}>
        <Button variant='contained' onClick={onSubmit}>
          {t('lending.withdraw.button.poolOverview')}
        </Button>
      </Box>
    </Box>
  )
}

export default ConfirmForm
