import { Box, Divider, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CountdownSection from '@/components/organisms/modals/WithdrawModal/WithdrawModalApprove/CountdownSection'

const WithdrawModalApprove: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box mt={3} px={1}>
      <Typography variant='subtitle2' color='textPrimary' mb={0.5}>
        {t('lending.withdraw.epochEnds')}
      </Typography>
      <Divider />
      <CountdownSection />

      <Box display='flex' flexDirection='column' alignItems='center' mt={2}>
        <Typography variant='body2' width='70%' textAlign='center'>
          {t('lending.withdraw.withdrawalSchedule')}
        </Typography>
      </Box>
    </Box>
  )
}

export default WithdrawModalApprove
