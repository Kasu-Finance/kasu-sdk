import { CustomTableHeader } from '@/components/molecules/CustomTable'
import { UNLOCK_TABLE_KEYS } from '@/components/molecules/locking/UnlockOverview'

const UnlockHeader: CustomTableHeader<typeof UNLOCK_TABLE_KEYS>[] = [
  {
    label: 'Amount Locked',
    value: 'lockedAmount',
  },
  {
    label: 'Unlock Date',
    value: 'endTime',
  },
  {
    label: (
      <>
        Remaining <br />
        Locking Duration
      </>
    ),
    value: 'remainingDuration', // using id here just for unique purposes, replaced in handleSort
  },
  {
    label: 'rKSU Multiplier',
    value: 'lockPeriod',
  },
  {
    label: 'rKSU Balance',
    value: 'rKSUAmount',
  },
]

export default UnlockHeader
