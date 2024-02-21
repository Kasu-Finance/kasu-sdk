'use client'

import { Box, Button, Divider } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import CurrentLoyaltyRatio from '@/components/molecules/locking/LoyaltyOverview/CurrentLoyaltyRatio'
import LoyaltyLevelInfo from '@/components/molecules/locking/LoyaltyOverview/LoyaltyLevelInfo'
import LoyaltyProgress from '@/components/molecules/locking/LoyaltyOverview/LoyaltyProgress'

import { ArrowRightIcon } from '@/assets/icons'

import { capitalize } from '@/utils'

const stakedPercentage: number = 15

const LoyaltyOverview = () => {
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  const isLoyal = currentLevel === 1 || currentLevel === 2

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
          {t('locking.widgets.loyalty.button')}
        </Button>
      }
    >
      <CurrentLoyaltyRatio stakedPercentage={stakedPercentage} />
      <Divider />
      <LoyaltyProgress stakedPercentage={stakedPercentage} />
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
      <LoyaltyLevelInfo
        rootStyles={{ mt: 2 }}
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
        description={
          isLoyal
            ? undefined
            : t('locking.widgets.loyalty.level.level-0.description')
        }
      />
    </CardWidget>
  )
}

export default LoyaltyOverview
