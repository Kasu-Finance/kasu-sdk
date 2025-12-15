import { Button, CardActions } from '@mui/material'
import Link from 'next/link'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import LendButton from '@/components/atoms/LendButton'

import { Routes } from '@/config/routes'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolCardActionsProps = {
  pools?: PoolOverviewWithDelegate[]
  pool: PoolOverviewWithDelegate
  currentEpoch: string
}

const PoolCardActions: React.FC<PoolCardActionsProps> = ({
  pools,
  pool,
  currentEpoch,
}) => {
  const { t } = getTranslation()

  return (
    <CardActions
      sx={{
        display: 'flex',
        bgcolor: 'white',
        width: '100%',
        justifyContent: 'center',
        px: 2,
        pt: 0,
        pb: 2,
        gap: 3,
      }}
      disableSpacing
    >
      <Button
        href={`${Routes.lending.root.url}/${pool.id}`}
        component={Link}
        variant='outlined'
        sx={{ flex: 1, textTransform: 'capitalize', ml: 0 }}
      >
        {t('general.overview')}
      </Button>
      {pool.isActive && !pool.isOversubscribed && (
        <LendButton pool={pool} pools={pools} currentEpoch={currentEpoch} />
      )}
    </CardActions>
  )
}

export default PoolCardActions
