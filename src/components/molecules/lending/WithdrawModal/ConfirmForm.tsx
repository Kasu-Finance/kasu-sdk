import { Box, Button, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import React, { memo, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import { formatAccount } from '@/utils'

interface ConfirmFormProps {
  poolName: string
  trancheName: string
  onSubmit: () => void
}

const ConfirmForm: React.FC<ConfirmFormProps> = ({
  poolName,
  trancheName,
  onSubmit,
}) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()

  const userAddress = useMemo(() => formatAccount(account), [account])
  const amount = '10,000.00'

  return (
    <Box width='100%' mt={3}>
      <Typography variant='subtitle2' color='textPrimary'>
        You have successfully queued:
      </Typography>

      <Typography variant='subtitle2' color='textPrimary'>
        <b>• {amount} KSU •</b> to be withdrawn in the next Epoch
      </Typography>

      <Typography variant='subtitle2' color='textPrimary' ml={1.5}>
        from <b>{poolName} </b>
      </Typography>
      <Typography
        variant='body2'
        color='textPrimary'
        fontSize={12}
        mt={-0.5}
        ml={1.5}
      >
        (subject to available liquidity)
      </Typography>

      <Typography variant='subtitle2' color='textPrimary' ml={1.5}>
        Tranche <b>• {trancheName}</b>
      </Typography>
      <Typography variant='subtitle2' color='textPrimary'>
        <b>• {amount} KSU •</b> to be deposited to to wallet address
        <b style={{ textTransform: 'uppercase' }}> {userAddress}</b>
      </Typography>

      <Typography
        variant='body2'
        color='textPrimary'
        fontSize={12}
        mt={-0.5}
        ml={1.5}
      >
        (subject to available liquidity)
      </Typography>

      <Box display='flex' justifyContent='center' width='100%' mt={3}>
        <Button variant='contained' onClick={onSubmit}>
          {t('lending.withdraw.button.poolOverview')}
        </Button>
      </Box>
    </Box>
  )
}

export default memo(ConfirmForm)
