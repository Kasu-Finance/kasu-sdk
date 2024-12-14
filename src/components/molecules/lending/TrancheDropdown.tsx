import { SelectChangeEvent, Typography } from '@mui/material'
import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'

import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

type TrancheDropdownProps = {
  tranches: TrancheData[]
  selectedTranche?: `0x${string}`
  setSelectedTranche: (
    selectedTranche: `0x${string}`,
    defaultFixedTermConfigId: string | undefined
  ) => void
}

const TrancheDropdown: React.FC<TrancheDropdownProps> = ({
  selectedTranche,
  setSelectedTranche,
  tranches,
}) => {
  const { t } = getTranslation()

  if (tranches.length <= 1) {
    return null
  }

  const handleChange = (e: SelectChangeEvent) => {
    const trancheValue = e.target.value

    const tranche = tranches.find((tranche) => tranche.id === trancheValue)

    setSelectedTranche(
      trancheValue as `0x${string}`,
      tranche?.fixedTermConfig.length ? undefined : '0'
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
        <Typography variant='baseMd' py={1}>
          {val.name} {t('general.tranche')}
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
