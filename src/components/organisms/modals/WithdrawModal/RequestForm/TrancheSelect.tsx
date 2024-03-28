import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'

import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import { Tranche } from '@/context/withdrawModal/withdrawModal.types'

interface TrancheSelectProps {
  poolData: PoolOverview
}

const TrancheSelect: React.FC<TrancheSelectProps> = ({ poolData }) => {
  const { t } = useTranslation()
  const { selectedTranche, setSelectedTranche } = useWithdrawModalState()
  console.warn('poolData', poolData)

  if (poolData.tranches.length <= 1) return null

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
          value={selectedTranche}
          onChange={(e) => setSelectedTranche(e.target.value as Tranche)}
          label={t('lending.withdraw.dropdown.label')}
        >
          {poolData.tranches.map(({ id: trancheId, name }) => (
            <MenuItem key={trancheId} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default TrancheSelect
