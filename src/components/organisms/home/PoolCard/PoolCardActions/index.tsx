import { Button, CardActions } from '@mui/material'
import Link from 'next/link'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import LendButton from '@/components/organisms/home/PoolCard/PoolCardActions/LendButton'

import { Routes } from '@/config/routes'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolCardActionsProps = {
  pool: PoolOverviewWithDelegate
}

const PoolCardActions: React.FC<PoolCardActionsProps> = ({ pool }) => {
  const { t } = useTranslation()

  return (
    <CardActions
      sx={{
        display: 'flex',
        bgcolor: 'white',
        width: '100%',
        justifyContent: 'center',
        mt: 'auto',
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
      {pool.isActive && <LendButton pool={pool} />}
    </CardActions>
  )
}

export default PoolCardActions
