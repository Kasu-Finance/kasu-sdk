import { Box, Divider, Typography } from '@mui/material'
import React from 'react'

import useEstimatedDepositValue from '@/hooks/locking/useEstimatedDepositValue'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'

import EstimatesRow from './EstimatesRow'

type EstimatedReturnsProps = {
  amount: string
}

const EstimatedReturns: React.FC<EstimatedReturnsProps> = ({ amount }) => {
  const estimatedDepositValueUSD = useEstimatedDepositValue(amount)
  const { t } = useTranslation()
  const tBase = 'modals.lock.estimates.'

  return (
    <Box>
      <Typography
        variant='subtitle1'
        component='span'
        display='block'
        sx={{ textTransform: 'capitalize' }}
      >
        {t(tBase + 'title')}
      </Typography>
      <ColoredBox mt={1}>
        <EstimatesRow
          title={t(tBase + 'est-1')}
          info={t(tBase + 'tooltip-1')}
          value={`$ ${estimatedDepositValueUSD}`}
        />
        <Divider />
        <EstimatesRow
          title={t(tBase + 'est-2')}
          info={t(tBase + 'tooltip-2')}
          value='0.00 KSU'
        />
        <Divider />
        <EstimatesRow
          title={t(tBase + 'est-3')}
          info={t(tBase + 'tooltip-3')}
          value='0.00 %'
        />
        <Divider />
        <EstimatesRow
          title={t(tBase + 'est-4')}
          info={t(tBase + 'tooltip-4')}
          value='0.00 USDC'
        />
      </ColoredBox>
    </Box>
  )
}

export default EstimatedReturns
