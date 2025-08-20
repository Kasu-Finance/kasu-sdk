import { Stack, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import getTranslation from '@/hooks/useTranslation'

import BuyKasuConfirmationAction from '@/components/organisms/modals/BuyKasuModal/BuyKasuConfirmation/BuyKasuConfirmationAction'

import { formatAccount, formatAmount } from '@/utils'

const BuyKasuModalConfirmation = () => {
  const { t } = getTranslation()

  const { account } = useWeb3React()

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>
        {t('modals.buyKasu.confirmation.title')}
      </Typography>
      <Typography variant='baseMd'>
        <Typography variant='baseMdBold'>{formatAmount('0')} KASU </Typography>
        {t('modals.buyKasu.confirmation.description-1')}{' '}
        <Typography variant='baseMdBold'>
          {formatAmount('0.00', {
            minDecimals: 2,
          })}{' '}
          KASU{' '}
        </Typography>
        =
        <Typography variant='baseMdBold'>
          {' '}
          {formatAmount('0.00', {
            minDecimals: 2,
          })}{' '}
          KASU{' '}
        </Typography>
      </Typography>
      <Typography variant='baseMd'>
        <Typography variant='baseMdBold'>
          {' '}
          {formatAmount('0.00', {
            minDecimals: 2,
          })}{' '}
          KASU{' '}
        </Typography>
        {t('modals.buyKasu.confirmation.description-2')}{' '}
        <Typography variant='baseMdBold'>{formatAccount(account)} </Typography>
        {t('modals.buyKasu.confirmation.description-3')}
      </Typography>
      <BuyKasuConfirmationAction />
    </Stack>
  )
}

export default BuyKasuModalConfirmation
