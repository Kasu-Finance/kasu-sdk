import { Box, Button, Stack, Typography } from '@mui/material'

import useFixApyState from '@/hooks/context/useFixApyState'
import useModalState from '@/hooks/context/useModalState'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'
import { useExplorerUrl } from '@/hooks/web3/useExplorerUrl'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'
import {
  capitalize,
  formatAmount,
  formatTimestamp,
  mergeSubheading,
} from '@/utils'

const FixApyConfirmed = () => {
  const { t } = getTranslation()

  const { getTxUrl } = useExplorerUrl()

  const { amount, txHash } = useFixApyState()

  const { modal, closeModal } = useModalState()

  const { pool } = modal[ModalsKeys.FIX_APY]

  const handleClose = () => closeModal(ModalsKeys.FIX_APY)

  const { nextEpochTime } = useNextEpochTime()

  const formattedTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>{t('modals.fixApy.description-3')}</Typography>
      <Typography variant='baseMd'>
        <Typography variant='baseMdBold'>
          {formatAmount(amount, { minDecimals: 2 })} USDC{' '}
        </Typography>
        {t('modals.fixApy.description-4').replace(
          '{{ time }}',
          `${formattedTime.date} • ${formattedTime.timestamp} ${formattedTime.utcOffset}`
        )}{' '}
        <Typography variant='baseMdBold'>
          {mergeSubheading(pool.poolName, pool.subheading)}
        </Typography>{' '}
        {capitalize(t('general.lendingStrategy'))}
      </Typography>
      <Typography variant='baseSm'>
        {t('modals.fixApy.description-5')}{' '}
        <Button
          variant='text'
          sx={{
            p: 0,
            height: 'auto',
            textTransform: 'unset',
            font: 'inherit',
            verticalAlign: 'inherit',
            display: 'inline',
            color: 'white',
          }}
          href={Routes.portfolio.root.url}
          target='_blank'
          style={{ font: 'inherit', color: 'white' }}
        >
          {t('general.myPortfolio')}
        </Button>{' '}
        {t('modals.fixApy.description-6')}
      </Typography>
      <Box display='flex' gap={4}>
        {txHash && (
          <Button
            variant='outlined'
            color='secondary'
            href={getTxUrl(txHash)}
            target='_blank'
            fullWidth
            sx={{ textTransform: 'capitalize' }}
          >
            {t('modals.fixApy.viewTx')}
          </Button>
        )}
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
          onClick={handleClose}
        >
          {t('general.close')}
        </Button>
      </Box>
    </Stack>
  )
}

export default FixApyConfirmed
