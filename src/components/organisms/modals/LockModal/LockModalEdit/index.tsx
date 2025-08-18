import { Box, Stack } from '@mui/material'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { memo, useDeferredValue, useMemo, useState } from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useUserBalance from '@/hooks/web3/useUserBalance'

import EstimatedBonusRewards from '@/components/organisms/modals/LockModal/LockModalEdit/EstimatedBonusRewards'
import LockModalBalanceOverview from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalBalanceOverview'
import LockModalDuration from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalDuration'
import LockModalEditActions from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalEditActions'
import LockModalInput from '@/components/organisms/modals/LockModal/LockModalEdit/LockModalInput'
import MinRequiredLockAmount from '@/components/organisms/modals/LockModal/LockModalEdit/MinRequiredLockAmount'

import sdkConfig from '@/config/sdk'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LockModalEdit = () => {
  const { amount: prevAmount, selectedLockPeriod: prevSelectedLockPeriod } =
    useLockModalState()

  const [amount, setAmount] = useState(prevAmount)
  const [selectedLockPeriod, setSelectedLockPeriod] = useState(
    prevSelectedLockPeriod
  )

  const deferredAmount = useDeferredValue(amount)
  const deferredLockPeriod = useDeferredValue(selectedLockPeriod)

  const { balance: ksuBalance, decimals } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

  const { ksuPrice } = useKsuPrice()

  const balance = useMemo(
    () => formatUnits(ksuBalance, decimals),
    [ksuBalance, decimals]
  )

  const ksuInUSD = useMemo(
    () =>
      convertToUSD(toBigNumber(deferredAmount), toBigNumber(ksuPrice || '0')),
    [deferredAmount, ksuPrice]
  )

  return (
    <Stack spacing={3}>
      <LockModalBalanceOverview />
      <Box>
        <LockModalInput
          amount={amount}
          balance={balance}
          decimals={decimals}
          ksuInUSD={formatAmount(formatEther(ksuInUSD), {
            minDecimals: 2,
            minValue: 10_000,
          })}
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

export default memo(LockModalEdit)
