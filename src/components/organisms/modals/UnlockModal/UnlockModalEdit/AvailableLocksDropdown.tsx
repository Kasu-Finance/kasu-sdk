import { SelectChangeEvent, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import React from 'react'

import CustomSelect from '@/components/atoms/CustomSelect'
import AvailableLockItem from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/AvailableLockItem'

type AvailableLocksDropdownProps = {
  selectedLock: UserLock
  userLocks: UserLock[]
  handleSelectedLockChange: (userLock: UserLock) => void
}

const AvailableLocksDropdown: React.FC<AvailableLocksDropdownProps> = ({
  userLocks,
  selectedLock,
  handleSelectedLockChange,
}) => {
  const handleChange = (e: SelectChangeEvent) => {
    const lockId = e.target.value

    const userLock = userLocks.find(
      (lock) => lock.id.toString() === lockId.toString()
    )

    if (!userLock) return

    handleSelectedLockChange(userLock)
  }

  return (
    <CustomSelect
      variant='secondary'
      options={userLocks.map((lock) => ({
        ...lock,
        id: lock.id.toString(),
      }))}
      label='Available Locks'
      labelKey='id'
      valueKey='id'
      value={selectedLock.id.toString()}
      onChange={handleChange}
      renderSelected={(val) => {
        if (!val) return <Typography variant='baseMd'>Select Lock</Typography>

        return <AvailableLockItem userLock={val} />
      }}
      renderItem={(val) => (
        <AvailableLockItem userLock={val} key={val.id} py={1} />
      )}
      selectSx={{ '.MuiOutlinedInput-input': { pl: 3 } }}
    />
  )
}

export default AvailableLocksDropdown
