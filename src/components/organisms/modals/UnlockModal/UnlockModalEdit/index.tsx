import { Stack } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { useState } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import useUnlockModalState from '@/hooks/context/useUnlockModalState'

import AvailableLocksDropdown from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/AvailableLocksDropdown'
import UnlockModalEditActions from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalEditActions'
import UnlockModalEditDescription from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalEditDescription'
import UnlockModalInput from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalInput'
import UnlockModalOverview from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockModalOverview'
import UnlockRemainingInfo from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/UnlockRemainingInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

const UnlockModalEdit = () => {
  const { isLiteMode } = useLiteModeState()

  const { modal } = useModalState()

  const { setUserLock } = useUnlockModalState()

  const { userLocks, userLock } = modal[ModalsKeys.UNLOCK]

  const [selectedLock, setSelectedLock] = useState(userLock)

  const handleSelectedLockChange = (lock: UserLock) => {
    setUserLock(lock)
    setSelectedLock(lock)
  }

  return (
    <Stack spacing={3} mt={3}>
      <UnlockModalOverview />
      <UnlockModalEditDescription />
      <UnlockRemainingInfo userLock={selectedLock} />
      {isLiteMode && userLocks?.length && (
        <AvailableLocksDropdown
          selectedLock={selectedLock}
          userLocks={userLocks}
          handleSelectedLockChange={handleSelectedLockChange}
        />
      )}
      <UnlockModalInput userLock={selectedLock} />
      <UnlockModalEditActions />
    </Stack>
  )
}

export default UnlockModalEdit
