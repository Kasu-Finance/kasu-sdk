'use client'

import { Stack, Typography } from '@mui/material'

import useLoanTickets from '@/hooks/lending/useLoanTickets'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import WaveBox from '@/components/atoms/WaveBox'
import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'
import LendingDecisionsPendingTableHeader from '@/components/organisms/lite/LendingDecisionsPending/LendingDecisionsPendingTableHeader'
import LendingDecisionsPendingTableBody from '@/components/organisms/lite/LendingDecisionsPending/LendingDecisionsTableBody'

import { mapPendingDecisionsToPools, mergeSubheading } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type LendingDecisionsPendingProps = {
  pools: PoolOverviewWithDelegate[]
}

const LendingDecisionsPending: React.FC<LendingDecisionsPendingProps> = ({
  pools,
}) => {
  const { t } = getTranslation()

  const { isAuthenticated } = usePrivyAuthenticated()

  const { loanTickets } = useLoanTickets()

  if (!isAuthenticated || !loanTickets) return null

  const { count, pendingDecisions } = mapPendingDecisionsToPools(
    loanTickets,
    pools.map((pool) => ({
      ...pool,
      poolName: mergeSubheading(pool.poolName, pool.subheading),
    }))
  )

  if (!count) return null

  return (
    <WaveBox variant='dark-middle' borderRadius={4} p={2}>
      <Stack spacing={3}>
        <Typography variant='h4' color='white'>
          {t('lite.lendingDecisionsPending.title')}
        </Typography>
        <LiteModeTable
          tableHeader={<LendingDecisionsPendingTableHeader />}
          tableBody={
            <LendingDecisionsPendingTableBody
              pendingDecisions={pendingDecisions}
            />
          }
        />
      </Stack>
    </WaveBox>
  )
}

export default LendingDecisionsPending
