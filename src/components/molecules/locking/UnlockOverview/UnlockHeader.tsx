import { TranslateFunction } from '@/hooks/useTranslation'

import { CustomTableHeader } from '@/components/molecules/CustomTable'
import { UNLOCK_TABLE_KEYS } from '@/components/molecules/locking/UnlockOverview'

const UnlockHeader: (
  t: TranslateFunction
) => CustomTableHeader<typeof UNLOCK_TABLE_KEYS>[] = (t) => [
  {
    label: t('locking.widgets.unlock.table.headers.amountLocked'),
    value: 'lockedAmount',
  },
  {
    label: t('locking.widgets.unlock.table.headers.unlockDate'),
    value: 'endTime',
  },
  {
    label: (
      <>
        {t('locking.widgets.unlock.table.headers.remainingDuration.1')} <br />
        {t('locking.widgets.unlock.table.headers.remainingDuration.2')}
      </>
    ),
    value: 'remainingDuration', // using id here just for unique purposes, replaced in handleSort
  },
  {
    label: t('locking.widgets.unlock.table.headers.multiplier'),
    value: 'lockPeriod',
  },
  {
    label: t('locking.widgets.unlock.table.headers.balance'),
    value: 'rKSUAmount',
  },
]

export default UnlockHeader
