import { Button, Stack, Typography } from '@mui/material'

import useFixApyState from '@/hooks/context/useFixApyState'
import useModalState from '@/hooks/context/useModalState'
import useFixApy from '@/hooks/lending/useFixApy'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import FixAmountInput from '@/components/organisms/modals/FixApyModal/FixAmountInput'
import FixAmountSelect from '@/components/organisms/modals/FixApyModal/FixAmountSelect'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'
import { formatAmount } from '@/utils'

const FixApyEdit = () => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { pool } = modal[ModalsKeys.FIX_APY]

  const balance = pool.selectedTranche.balanceData.balance

  const { amount, fixedTermConfigId } = useFixApyState()

  const fixApy = useFixApy()

  const handleClick = async () => {
    if (!amount) {
      return console.error('FixApy:: Amount is undefined')
    }

    if (!fixedTermConfigId) {
      return console.error('FixApy:: fixedTermConfigId is undefined')
    }

    await fixApy(pool.id, pool.selectedTranche.id, amount, fixedTermConfigId)
  }

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
            {formatAmount(balance, {
              minDecimals: 2,
            })}{' '}
            USDC
          </Typography>
        }
      />
      <Stack spacing={2}>
        <FixAmountInput balance={balance} />
        <FixAmountSelect
          fixedTermConfigs={pool.selectedTranche.fixedTermConfig}
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
          disabled={Boolean(!amount || !fixedTermConfigId)}
          onClick={handleClick}
        >
          {t('modals.fixApy.action')}
        </Button>
      </Stack>
    </Stack>
  )
}

export default FixApyEdit
