import { Typography } from '@mui/material'
import { Box } from '@mui/system'

import useModalState from '@/hooks/context/useModalState'
import useStakedKSU from '@/hooks/locking/useStakedKSU'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { capitalize, formatAmount, formatTimestamp } from '@/utils'

const UnlockModalOverview = () => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { userLock } = modal[ModalsKeys.UNLOCK]

  const { stakedKSU } = useStakedKSU()

  const formattedTime = formatTimestamp(userLock.startTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box>
      <InfoRow
        title={t('general.totalKsuLocked')}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.unlock.editLock.totalKsuLocked-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(stakedKSU || 0, {
              minDecimals: 2,
            })}{' '}
            KASU
          </Typography>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
      <InfoRow
        title={t('modals.unlock.overview.lockedDate')}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.unlock.overview.metric-3-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formattedTime.date}{' '}
            <Typography variant='baseMd' color='rgba(133, 87, 38, 1)'>
              {formattedTime.timestamp} {formattedTime.utcOffset}
            </Typography>
          </Typography>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
      <InfoRow
        title={`rKASU ${capitalize(t('general.balance'))}`}
        toolTipInfo={
          <ToolTip
            title={t('modals.unlock.overview.metric-2-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(userLock.rKSUAmount, { minDecimals: 2 })} KASU
          </Typography>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
    </Box>
  )
}

export default UnlockModalOverview
