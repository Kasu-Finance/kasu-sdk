import { Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import FixAmountInput from '@/components/organisms/modals/FixApyModal/FixAmountInput'
import FixAmountSelect from '@/components/organisms/modals/FixApyModal/FixAmountSelect'

import { Routes } from '@/config/routes'
import { formatAmount } from '@/utils'

const FixApyEdit = () => {
  const { t } = getTranslation()

  const [amount, setAmount] = useState('')
  const [fixedTermConfigId, setFixedTermConfigId] = useState('')

  return (
    <Stack spacing={1}>
      <InfoRow
        title={t('modals.fixApy.availableToFix')}
        toolTipInfo={
          <ToolTip
            title={t('modals.fixApy.availableToFix-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        titleStyle={{ variant: 'h5' }}
        metric={
          <Typography variant='h5'>
            {formatAmount(10_000, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
      <Stack spacing={2}>
        <FixAmountInput amount={amount} setAmount={setAmount} />
        <FixAmountSelect
          fixedTermConfigs={[]}
          fixedTermConfigId={fixedTermConfigId}
          setFixedTermConfigId={setFixedTermConfigId}
        />
        <Typography variant='baseSm'>
          {t('modals.fixApy.description-1')}{' '}
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
          {t('modals.fixApy.description-2')}
        </Typography>
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
        >
          {t('modals.fixApy.action')}
        </Button>
      </Stack>
    </Stack>
  )
}

export default FixApyEdit
