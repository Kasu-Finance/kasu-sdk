import {
  BaseSelectProps,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  OutlinedSelectProps,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import { useMemo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'

import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

type DepositTrancheSelectProps = {
  poolData: PoolData
  selectProps?: OutlinedSelectProps & BaseSelectProps<string>
}

const DepositTrancheSelect: React.FC<DepositTrancheSelectProps> = ({
  poolData,
  selectProps,
}) => {
  const { trancheId, setSelectedTranche } = useDepositModalState()

  const selectedTrancheId = useMemo(() => {
    const existingTranche = poolData.tranches.find(
      (tranche) => tranche.trancheId === trancheId
    )

    if (existingTranche) {
      return existingTranche.trancheId
    }

    const seniorTranche = poolData.tranches.find((tranche) =>
      tranche.title.toLowerCase().includes('senior')
    )

    return (seniorTranche || poolData.tranches[0]).trancheId
  }, [poolData.tranches, trancheId])

  const handleChange = (e: SelectChangeEvent) => {
    const trancheValue = e.target.value
    setSelectedTranche(trancheValue as `0x${string}`)
  }

  if (poolData.tranches.length <= 1) return null

  return (
    <FormControl fullWidth={true}>
      <InputLabel shrink={true} htmlFor='tranche-selector'>
        Tranche
      </InputLabel>
      <Select
        notched={true}
        value={selectedTrancheId}
        inputProps={{
          id: 'tranche-selector',
        }}
        onChange={handleChange}
        input={<OutlinedInput label='Tranche' />}
        {...selectProps}
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
