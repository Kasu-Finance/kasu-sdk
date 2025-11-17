import { TrancheData } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { SelectChangeEvent, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'
import ToolTip from '@/components/atoms/ToolTip'

import { customPalette } from '@/themes/palette'
import { toBigNumber } from '@/utils'

type TrancheDropdownProps = {
  tranches: TrancheData[]
  selectedTranche?: `0x${string}`
  setSelectedTranche: (
    selectedTranche: `0x${string}`,
    defaultFixedTermConfigId: string | undefined
  ) => void
  disableOversubscribed?: boolean
  isWithdrawal?: boolean
}

const TrancheDropdown: React.FC<TrancheDropdownProps> = ({
  selectedTranche,
  setSelectedTranche,
  tranches,
  disableOversubscribed,
  isWithdrawal,
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
        <Typography
          variant='baseMd'
          py={1}
          display='inline-flex'
          alignItems='center'
          color={
            disableOversubscribed && toBigNumber(val.maximumDeposit).isZero()
              ? customPalette.gray.dark
              : undefined
          }
        >
          {val.name} {t('general.tranche')}{' '}
          {disableOversubscribed && toBigNumber(val.maximumDeposit).isZero() ? (
            <>
              (Oversubscribed)
              <ToolTip
                placement='top'
                title='This tranche is temporarily oversubscribed. Please check again in the next epoch.'
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
      )}
      selectSx={{
        '.MuiOutlinedInput-input': {
          pl: 3,
        },
      }}
      renderSelected={(val) =>
        val ? (
          <Typography variant='baseMd'>
            {val.name} {t('general.tranche')}
          </Typography>
        ) : (
          t('modals.withdrawal.selectTranche')
        )
      }
    />
  )
}

export default TrancheDropdown
