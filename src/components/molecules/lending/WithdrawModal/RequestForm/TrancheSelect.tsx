import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import { Tranche } from '@/constants'

interface TrancheSelectProps {
  selectedTranche: Tranche
  setSelectedTranche: (tranche: Tranche) => void
}

const TrancheSelect: React.FC<TrancheSelectProps> = ({
  selectedTranche,
  setSelectedTranche,
}) => {
  const { t } = useTranslation()

  return (
    <Box mt={3}>
      <FormControl fullWidth>
        <InputLabel>{t('lending.withdraw.dropdown.label')}</InputLabel>
        <Select
          value={selectedTranche}
          onChange={(e) => setSelectedTranche(e.target.value as Tranche)}
        >
          <MenuItem value={Tranche.SENIOR_TRANCHE}>
            {t('lending.withdraw.dropdown.option.senior')}
          </MenuItem>
          <MenuItem value={Tranche.MEZZANINE_TRANCE}>
            {t('lending.withdraw.dropdown.option.mezzanine')}
          </MenuItem>
          <MenuItem value={Tranche.JUNIOR_TRANCHE}>
            {t('lending.withdraw.dropdown.option.junior')}
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default TrancheSelect
