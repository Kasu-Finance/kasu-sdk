'use client'

import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import LoyaltyLevelInfo from '@/components/molecules/locking/LoyaltyOverview/LoyaltyLevelInfo'

import { ChevronLeftIcon } from '@/assets/icons'

const LoyaltyLevelsModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  return (
    <>
      <DialogHeader
        title={t('modals.loyalityLevels.title')}
        onClose={handleClose}
      />
      <DialogContent sx={{ px: 3, py: 1 }}>
        <Box display='grid' gap={2}>
          <Typography variant='h5' component='span' display='block'>
            {t('modals.loyalityLevels.subtitle-1')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.loyalityLevels.description-1')}
          </Typography>
          <Typography
            variant='subtitle1'
            fontSize={14}
            lineHeight='20px'
            component='p'
          >
            If you do not wish to lock KSU tokens, then you are can still
            participate in lending pools to earn APY. However, you will not
            receive any bonus APY, and any deposit/withdrawal request will be
            processed after Loyalty 1 and 2 Token Lockers.
          </Typography>
          <LoyaltyLevelInfo
            title={`${t('modals.loyalityLevels.level')} 1`}
            subtitle='If your ratio of accumulated rKSU to USDC deposits is between 1% - 5%, then you can enjoy the following benefits:'
            list={[
              'Second order priority access to lending pools (behind Loyalty Level 2).',
              'Second order priority for capital withdrawals from lending pools (behind Loyalty Level 2).',
              '0.1% additional APY from your deposits in all lending pools, awarded in KSU.',
            ]}
          />
          <LoyaltyLevelInfo
            title={`${t('modals.loyalityLevels.level')} 2`}
            subtitle='If your ratio of accumulated rKSU to USDC deposits is 5% or more, then you can enjoy the following benefits:'
            list={[
              'First order priority access to lending pools.',
              'Firstly order priority for capital withdrawals from lending pools.',
              '0.2% additional APY from your deposits in all lending pools, awarded in KSU.',
            ]}
          />
        </Box>
        <Typography variant='subtitle2' fontWeight={700} component='p'>
          Each KSU token that you unlock will burn a proportionate amount of
          rKSU. In order to maintain your loyalty level and associated
          privileges, be sure to maintain an amount of locked KSU to avoid
          burning rKSU to the point that it falls below the above minimum ratio
          of USDC deposits.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          variant='contained'
          startIcon={<ChevronLeftIcon />}
          onClick={handleClose}
          sx={{
            width: 130,
            '& .MuiButton-startIcon > svg > path': {
              fill: 'white',
            },
          }}
        >
          {t('general.return')}
        </Button>
      </DialogActions>
    </>
  )
}

export default LoyaltyLevelsModal
