import { SelectChangeEvent, Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

import { ModalsKeys } from '@/context/modal/modal.types'

const TrancheDropdown = () => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { trancheId, setSelectedTranche } = useDepositModalState()

  const pool = modal[ModalsKeys.LEND].pool

  if (pool.tranches.length <= 1) {
    return null
  }

  const handleChange = (e: SelectChangeEvent) => {
    const trancheValue = e.target.value
    setSelectedTranche(trancheValue as `0x${string}`)
  }

  return (
    <CustomSelect
      options={pool.tranches}
      label={t('general.tranche')}
      labelKey='name'
      valueKey='id'
      onChange={handleChange}
      value={trancheId}
      variant='secondary'
      renderItem={(val) => (
        <Typography variant='baseMd' py={1}>
          {val.name} {t('general.tranche')}
        </Typography>
      )}
      selectSx={{
        '.MuiOutlinedInput-input': {
          pl: 2,
        },
      }}
      renderSelected={(val) =>
        val ? (
          <Typography variant='baseMd'>
            {val.name} {t('general.tranche')}
          </Typography>
        ) : null
      }
    />
  )
}

export default TrancheDropdown
