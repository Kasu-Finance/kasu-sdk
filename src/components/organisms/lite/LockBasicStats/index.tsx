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
          toolTipInfo='The amount of KASU tokens held in your wallet that is currently connected to the Kasu dApp.'
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
          toolTipInfo='The current USDC balance in your wallet currently connected to the Kasu dApp that can be used to purchase KASU tokens via the dApp.'
          metric={<UsdcBalance color='white' />}
        />
      </Stack>
      <InfoRow
        title={t('general.totalKsuLocked')}
        titleStyle={{
          color: 'white',
          textTransform: 'capitalize',
        }}
        toolTipInfo='The amount of KASU tokens locked held in your wallet that is currently connected to the Kasu dApp.'
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
