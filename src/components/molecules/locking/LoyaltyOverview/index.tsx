'use client'

import { Box, Button, Divider, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import LoyaltyLevelInfo from '@/components/molecules/locking/LoyaltyOverview/LoyaltyLevelInfo'
import LoyaltyProgress from '@/components/molecules/locking/LoyaltyOverview/LoyaltyProgress'

import { ArrowRightIcon } from '@/assets/icons'

import { capitalize } from '@/utils'

const stakedPercentage: number = 3

const LoyaltyOverview = () => {
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  const isLoyal = currentLevel === 1 || currentLevel === 2

  return (
    <CardWidget
      title='Loyalty Status'
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
          {t('locking.widgets.loyalty.button')}
        </Button>
      }
    >
      <LoyaltyLevelInfo
        rootStyles={{ mb: 2 }}
        title={t(
          `locking.widgets.loyalty.level.level-${
            isLoyal ? currentLevel : 0
          }.title`
        )}
        subtitle={
          isLoyal
            ? t(`locking.widgets.loyalty.level.level-${currentLevel}.subtitle`)
            : undefined
        }
        list={
          isLoyal
            ? [
                t(
                  `locking.widgets.loyalty.level.level-${currentLevel}.list.list-0`
                ),
                t(
                  `locking.widgets.loyalty.level.level-${currentLevel}.list.list-1`
                ),
                t(
                  `locking.widgets.loyalty.level.level-${currentLevel}.list.list-2`
                ),
              ]
            : undefined
        }
      />
      <InfoRow
        title={`rKSU ${capitalize(t('general.balance'))}`}
        toolTipInfo='info'
        metric={
          <Box>
            <TokenAmount amount='15,000.00' symbol='rKSU' />
          </Box>
        }
      />
      <Divider />
      <InfoRow
        title={t('locking.widgets.loyalty.metric-2')}
        toolTipInfo='info'
        metric={
          <Box>
            <TokenAmount amount='650,000.00' symbol='USDC' />
          </Box>
        }
      />
      <Divider />
      <InfoRow
        title='rKSU Ratio to Total USDC Deposits'
        toolTipInfo='info'
        metric={
          <Typography variant='h6' component='span'>
            1.15%
          </Typography>
        }
      />
      <LoyaltyProgress stakedPercentage={stakedPercentage} />
    </CardWidget>
  )
}

export default LoyaltyOverview
