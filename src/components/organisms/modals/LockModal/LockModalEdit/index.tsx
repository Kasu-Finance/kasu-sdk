import { Box, Stack } from '@mui/material'
import { useDeferredValue, useState } from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'

import EstimatedBonusRewards from '@/components/organisms/modals/LockModal/LockModalEdit/EstimatedBonusRewards'
import LockModalBalanceOverview from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalBalanceOverview'
import LockModalDuration from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalDuration'
import LockModalEditActions from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalEditActions'
import LockModalInput from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalInput'
import MinRequiredLockAmount from '@/components/organisms/modals/LockModal/LockModalEdit/MinRequiredLockAmount'

const LockModalEdit = () => {
  const { amount: prevAmount, selectedLockPeriod: prevSelectedLockPeriod } =
    useLockModalState()

  const [amount, setAmount] = useState(prevAmount)
  const [selectedLockPeriod, setSelectedLockPeriod] = useState(
    prevSelectedLockPeriod
  )

  const deferredAmount = useDeferredValue(amount)
  const deferredLockPeriod = useDeferredValue(selectedLockPeriod)

  return (
    <Stack spacing={3}>
      <LockModalBalanceOverview />
      <Box>
        <LockModalInput
          amount={amount}
          deferredAmount={deferredAmount}
          setAmount={setAmount}
        />
        <MinRequiredLockAmount selectedLockPeriod={selectedLockPeriod} />
      </Box>
      <LockModalDuration
        selectedLockPeriod={selectedLockPeriod}
        setSelectedLockPeriod={setSelectedLockPeriod}
      />
      <EstimatedBonusRewards
        amount={deferredAmount}
        selectedLockPeriod={deferredLockPeriod}
      />
      <LockModalEditActions
        amount={deferredAmount}
        selectedLockPeriod={deferredLockPeriod}
      />
    </Stack>
  )
}

export default LockModalEdit
