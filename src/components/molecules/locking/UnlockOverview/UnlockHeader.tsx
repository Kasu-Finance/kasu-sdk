import { UserLock } from 'kasu-sdk/src/types'

import { CustomTableHeader } from '@/components/molecules/customTable/TableHeaders'

const UnlockHeader: CustomTableHeader<Omit<UserLock, 'launchBonus'>>[] = [
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
    value: 'id', // using id here just for unique purposes, replaced in handleSort
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
