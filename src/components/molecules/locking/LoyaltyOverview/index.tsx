'use client'

import { Box, Button, Divider, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import ToolTip from '@/components/atoms/ToolTip'
import LoyaltyProgress from '@/components/molecules/locking/LoyaltyOverview/LoyaltyProgress'

import { ArrowRightIcon } from '@/assets/icons'

const LoyaltyOverview = () => {
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

  const isRegular = true

  return (
    <CardWidget
      cardAction={
        <Button
          sx={(theme) => ({
            '& .MuiButton-startIcon > svg > path': {
              fill: theme.palette.primary.main,
            },
          })}
          startIcon={<ArrowRightIcon />}
          variant='outlined'
          onClick={handleOpen}
        >
          {t('locking.widgets.loyality.button')}
        </Button>
      }
    >
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        p={(theme) => theme.spacing('6px', 2)}
      >
        <Box display='flex' alignItems='center'>
          <Typography variant='subtitle2'>Current Loyalty Ratio</Typography>
          <ToolTip title='info' />
        </Box>
        <Typography
          variant='h6'
          component='span'
          color={(theme) =>
            isRegular ? theme.palette.text.disabled : undefined
          }
        >
          None
        </Typography>
      </Box>
      <Divider />
      <LoyaltyProgress />
    </CardWidget>
  )
}

export default LoyaltyOverview
