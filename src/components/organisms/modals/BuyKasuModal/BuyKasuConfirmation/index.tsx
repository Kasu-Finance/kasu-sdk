import { Stack, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { useAccount } from 'wagmi'

import useBuyKasuModalState from '@/hooks/context/useBuyKasuModalState'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import BuyKasuConfirmationAction from '@/components/organisms/modals/BuyKasuModal/BuyKasuConfirmation/BuyKasuConfirmationAction'

import { formatAccount, formatAmount, toBigNumber } from '@/utils'

const BuyKasuModalConfirmation = () => {
  const { t } = getTranslation()

  const { address } = useAccount()

  const { amount, amountInUSD } = useBuyKasuModalState()

  const { ksuPrice } = useKsuPrice()

  const purchaseAmount =
    ksuPrice && !toBigNumber(ksuPrice).isZero()
      ? toBigNumber(amountInUSD ?? amount ?? '0')
          .mul(toBigNumber('1'))
          .div(parseEther(ksuPrice))
      : '0'

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>
        {t('modals.buyKasu.confirmation.title')}
      </Typography>
      <Typography variant='baseMd'>
        <Typography variant='baseMdBold'>
          {formatAmount(formatEther(purchaseAmount), { minDecimals: 2 })}{' '}
          KASU{' '}
        </Typography>
        {t('modals.buyKasu.confirmation.description-1')}{' '}
        <Typography variant='baseMdBold'>
          {formatAmount(1, {
            minDecimals: 2,
          })}{' '}
          KASU{' '}
        </Typography>
        =
        <Typography variant='baseMdBold'>
          {' '}
          {formatAmount(ksuPrice || '0', {
            minDecimals: 2,
          })}{' '}
          USDC
        </Typography>
      </Typography>
      <Typography variant='baseMd'>
        <Typography variant='baseMdBold'>
          {formatAmount(formatEther(purchaseAmount), {
            minDecimals: 2,
          })}{' '}
          KASU{' '}
        </Typography>
        {t('modals.buyKasu.confirmation.description-2')}{' '}
        <Typography variant='baseMdBold'>{formatAccount(address)} </Typography>
        {t('modals.buyKasu.confirmation.description-3')}
      </Typography>
      <BuyKasuConfirmationAction />
    </Stack>
  )
}

export default BuyKasuModalConfirmation
