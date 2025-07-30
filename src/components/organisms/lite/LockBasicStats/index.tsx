import { Stack } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import KsuBalance from '@/components/organisms/locking/UserFunds/KsuBalance'
import TotalKsuLocked from '@/components/organisms/locking/UserFunds/TotalKsuLocked'
import UsdcBalance from '@/components/organisms/locking/UserFunds/UsdcBalance'

const LockBasicStats = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3}>
      <Stack>
        <InfoRow
          title={`KASU ${t('general.balance')}`}
          titleStyle={{
            color: 'white',
            textTransform: 'capitalize',
          }}
          showDivider
          toolTipInfo='info'
          metric={
            <KsuBalance
              sx={{
                '.MuiTypography-root:first-of-type': {
                  color: 'white',
                },
              }}
            />
          }
        />
        <InfoRow
          title={t('general.availableFunds')}
          titleStyle={{
            color: 'white',
            textTransform: 'capitalize',
          }}
          showDivider
          toolTipInfo='info'
          metric={<UsdcBalance color='white' />}
        />
      </Stack>
      <InfoRow
        title={t('general.totalKsuLocked')}
        titleStyle={{
          color: 'white',
          textTransform: 'capitalize',
        }}
        toolTipInfo={t('locking.widgets.overview.metric-3-tooltip')}
        metric={
          <TotalKsuLocked
            sx={{
              '.MuiTypography-root:first-of-type': {
                color: 'white',
              },
            }}
          />
        }
      />
    </Stack>
  )
}

export default LockBasicStats
