import { UserLock } from 'kasu-sdk/src/types'

import { CustomTableHeader } from '@/components/molecules/CustomTable'

const UnlockHeader: CustomTableHeader<Omit<UserLock, 'id' | 'launchBonus'>>[] =
  [
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
      value: 'endTime',
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
