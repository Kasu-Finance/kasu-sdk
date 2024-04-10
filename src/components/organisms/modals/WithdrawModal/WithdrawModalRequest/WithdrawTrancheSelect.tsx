import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import { HexString } from '@/types/lending'

interface WithdrawTrancheSelectProps {
  poolData: PoolOverview
}

const WithdrawTrancheSelect: React.FC<WithdrawTrancheSelectProps> = ({
  poolData,
}) => {
  const { t } = useTranslation()
  const { selectedTranche, setSelectedTranche } = useWithdrawModalState()

  const getUserTranche = useMemo(
    () => poolData?.tranches?.find((tranche) => tranche.id === selectedTranche),
    [poolData?.tranches, selectedTranche]
  )

  if (poolData.tranches.length <= 1) return null

  const handleTrancheChange = (event: SelectChangeEvent) => {
    const selectedName = event.target.value as string
    const selectedTranche = poolData.tranches.find(
      (tranche) => tranche.name === selectedName
    )

    if (selectedTranche) {
      setSelectedTranche(selectedTranche.id as HexString)
    }
  }

  return (
    <Box mt={3}>
      <FormControl fullWidth>
        <InputLabel id='tranche-select-label'>
          {t('lending.withdraw.dropdown.label')}
        </InputLabel>
        <Select
          size='small'
          id='tranche'
          labelId='tranche-select-label'
          value={getUserTranche?.name || ''}
          onChange={handleTrancheChange}
          label={t('lending.withdraw.dropdown.label')}
        >
          {poolData.tranches.map(({ id: trancheId, name }) => (
            <MenuItem key={trancheId} value={name}>
              {t(`lending.tranche.${name.toLowerCase()}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default WithdrawTrancheSelect
