'use client'

import { Box, Button, Divider } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import CurrentLoyaltyRatio from '@/components/molecules/locking/LoyaltyOverview/CurrentLoyaltyRatio'
import LoyaltyLevelInfo from '@/components/molecules/locking/LoyaltyOverview/LoyaltyLevelInfo'
import LoyaltyProgress from '@/components/molecules/locking/LoyaltyOverview/LoyaltyProgress'

import { ArrowRightIcon } from '@/assets/icons'

const stakedPercentage: number = 2

const LoyaltyOverview = () => {
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

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
      <CurrentLoyaltyRatio stakedPercentage={stakedPercentage} />
      <Divider />
      <LoyaltyProgress stakedPercentage={stakedPercentage} />
      <InfoRow
        title='rKSU Balance'
        toolTipInfo='info'
        metric={
          <Box>
            <TokenAmount amount='15,000.00' symbol='rKSU' />
          </Box>
        }
      />
      <Divider />
      <InfoRow
        title='Total Deposited'
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
        title={`${t('modals.loyalityLevels.level')} 1`}
        subtitle={t('modals.loyalityLevels.level-1.description')}
        list={[
          'Second order priority access to lending pools (behind Loyalty Level 2).',
          'Second order priority for capital withdrawals from lending pools (behind Loyalty Level 2).',
          '0.1% additional APY from your deposits in all lending pools, awarded in KSU.',
        ]}
      />
    </CardWidget>
  )
}

export default LoyaltyOverview
