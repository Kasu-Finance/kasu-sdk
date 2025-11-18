import { Box, SelectChangeEvent, Typography } from '@mui/material'
import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'

import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'
import ToolTip from '@/components/atoms/ToolTip'

import { customPalette } from '@/themes/palette'
import { formatPercentage, toBigNumber } from '@/utils'

type TrancheDropdownProps = {
  tranches: TrancheData[]
  selectedTranche?: `0x${string}`
  setSelectedTranche: (
    selectedTranche: `0x${string}`,
    defaultFixedTermConfigId: string | undefined
  ) => void
  disableOversubscribed?: boolean
  isWithdrawal?: boolean
  showApy?: boolean
}

const TrancheDropdown: React.FC<TrancheDropdownProps> = ({
  selectedTranche,
  setSelectedTranche,
  tranches,
  disableOversubscribed,
  isWithdrawal,
  showApy,
}) => {
  const { t } = getTranslation()

  if (tranches.length <= 1) {
    return null
  }

  const handleChange = (e: SelectChangeEvent) => {
    const trancheValue = e.target.value

    const tranche = tranches.find((tranche) => tranche.id === trancheValue)

    if (
      !tranche ||
      (!isWithdrawal && toBigNumber(tranche.maximumDeposit).isZero())
    )
      return

    setSelectedTranche(
      trancheValue as `0x${string}`,
      tranche.fixedTermConfig.length ? undefined : '0'
    )
  }

  return (
    <CustomSelect
      options={tranches}
      label={t('general.tranche')}
      labelKey='name'
      valueKey='id'
      onChange={handleChange}
      value={selectedTranche ?? ''}
      variant='secondary'
      renderItem={(val) => (
        <Box
          py={1}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          color={
            disableOversubscribed && toBigNumber(val.maximumDeposit).isZero()
              ? customPalette.gray.dark
              : undefined
          }
          width='100%'
        >
          <Typography
            variant='baseMd'
            display='inline-flex'
            alignItems='center'
            color='inherit'
          >
            {val.name} {t('general.tranche')}{' '}
            {disableOversubscribed &&
            toBigNumber(val.maximumDeposit).isZero() ? (
              <>
                (Full)
                <ToolTip
                  placement='top'
                  title='This Loan Tranche is temporarily full. Please check again in the next weekly epoch. Each weekly epoch ends every Tuesday at 6am UTC.'
                  iconSx={{
                    color: customPalette.gold.dark,
                    '&:hover': {
                      color: customPalette.gold.extraDark,
                    },
                  }}
                />
              </>
            ) : null}
          </Typography>
          {showApy && (
            <Typography variant='baseMd' color='inherit'>
              {formatPercentage(val.apy)} {t('general.grossApy')}
            </Typography>
          )}
        </Box>
      )}
      selectSx={{
        '.MuiOutlinedInput-input': {
          pl: 3,
        },
      }}
      renderSelected={(val) =>
        val ? (
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            width='100%'
          >
            <Typography variant='baseMd'>
              {val.name} {t('general.tranche')}
            </Typography>
            {showApy && (
              <Typography variant='baseMd' color='inherit'>
                {formatPercentage(val.apy)} {t('general.grossApy')}
              </Typography>
            )}
          </Box>
        ) : (
          t('modals.withdrawal.selectTranche')
        )
      }
    />
  )
}

export default TrancheDropdown
