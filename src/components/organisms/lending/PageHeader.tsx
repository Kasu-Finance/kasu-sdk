import { Avatar, Box, Button, Typography } from '@mui/material'
import Link from 'next/link'

import useTranslation from '@/hooks/useTranslation'

import { ChevronLeftRoundedIcon } from '@/assets/icons'

import { getPoolOverview } from '@/app/_requests/pools'
import { Routes } from '@/config/routes'

type PageHeaderProps = {
  poolId: string
}

const PageHeader: React.FC<PageHeaderProps> = async ({ poolId }) => {
  const { t } = useTranslation()

  const pools = await getPoolOverview()

  const pool = pools.find((pool) => pool.id === poolId)

  if (!pool) return null

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      mb={3}
    >
      <Box display='flex' alignItems='center' gap={2}>
        <Avatar
          variant='circular'
          src={pool.thumbnailImageUrl}
          alt={pool.poolName}
          sx={{ width: 64, height: 64, bgcolor: 'gray.extraDark' }}
        />
        <Typography variant='h2'>{pool.poolName}</Typography>
      </Box>
      <Button
        LinkComponent={Link}
        href={Routes.lending.root.url}
        startIcon={<ChevronLeftRoundedIcon />}
        sx={{
          textTransform: 'unset',
          minWidth: 233,
          '.MuiButton-icon': {
            mr: '13px',
          },
        }}
      >
        {t('general.goBack')}
      </Button>
    </Box>
  )
}

export default PageHeader
