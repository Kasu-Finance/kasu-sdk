import { Card, CardContent, Grid } from '@mui/material'
import {
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import TrancheCard from '@/components/molecules/lending/overview/TranchCard'

import { COLS } from '@/constants'
import { sortTranches } from '@/utils'

interface TranchesDetailsProps {
  pool: PoolOverview
}

const TranchesDetails: React.FC<TranchesDetailsProps> = ({ pool }) => {
  const sortedTranches = useMemo(
    () => sortTranches(pool.tranches as TrancheData[]),
    [pool.tranches]
  )
  const trancheCount = sortedTranches.length
  const columnWidth = COLS / trancheCount
  const isSingleTranche = trancheCount === 1

  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  return (
    <Card>
      <CardContent
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
        <Grid
          container
          columnSpacing={3}
          rowGap={2}
          direction={isMobile ? 'column' : 'row'}
        >
          {sortedTranches.map((tranche) => (
            <TrancheCard
              key={tranche.id}
              tranche={tranche}
              isSingleTranche={isSingleTranche}
              columnWidth={columnWidth}
            />
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default TranchesDetails
