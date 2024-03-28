import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'

import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

type DepositTrancheSelectProps = {
  poolData: PoolData
}

const DepositTrancheSelect: React.FC<DepositTrancheSelectProps> = ({
  poolData,
}) => {
  const { trancheId, setSelectedTranche } = useDepositModalState()

  const handleChange = (e: SelectChangeEvent) => {
    setSelectedTranche(e.target.value)
  }

  if (poolData.tranches.length <= 1) return null

  return (
    <FormControl fullWidth={true}>
      <InputLabel shrink={true} htmlFor='tranche-selector'>
        Tranche
      </InputLabel>
      <Select
        notched={true}
        value={trancheId}
        inputProps={{
          id: 'tranche-selector',
        }}
        onChange={handleChange}
        input={<OutlinedInput label='Tranche' />}
      >
        {poolData.tranches.map(({ trancheId, title }) => (
          <MenuItem key={trancheId} value={trancheId}>
            {title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default DepositTrancheSelect
