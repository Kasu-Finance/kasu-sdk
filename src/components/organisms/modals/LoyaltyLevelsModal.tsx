'use client'

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
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

const LoyaltyLevelsModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  return (
    <>
      <DialogHeader
        title={t('modals.loyaltyLevels.title')}
        onClose={handleClose}
      />
      <DialogContent sx={{ px: 3, py: 1 }}>
        <Box display='grid' gap={2}>
          <Typography variant='h6' component='span' display='block'>
            {t('modals.loyaltyLevels.subtitle')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.loyaltyLevels.description-1')}
          </Typography>
          <Typography
            variant='subtitle1'
            fontSize={14}
            lineHeight='20px'
            component='p'
          >
            {t('modals.loyaltyLevels.description-2')}
          </Typography>
          <LoyaltyLevelInfo
            title={t('locking.widgets.loyalty.level.level-1.title')}
            subtitle={t('locking.widgets.loyalty.level.level-1.subtitle')}
            list={[
              t('locking.widgets.loyalty.level.level-1.list.list-0'),
              t('locking.widgets.loyalty.level.level-1.list.list-1'),
              t('locking.widgets.loyalty.level.level-1.list.list-2'),
            ]}
          />
          <LoyaltyLevelInfo
            title={t('locking.widgets.loyalty.level.level-2.title')}
            subtitle={t('locking.widgets.loyalty.level.level-2.subtitle')}
            list={[
              t('locking.widgets.loyalty.level.level-2.list.list-0'),
              t('locking.widgets.loyalty.level.level-2.list.list-1'),
              t('locking.widgets.loyalty.level.level-2.list.list-2'),
            ]}
          />
        </Box>
        <Typography variant='subtitle2' fontWeight={700} component='p' mt={1}>
          {t('modals.loyaltyLevels.description-3')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          variant='contained'
          startIcon={<ChevronLeftIcon />}
          onClick={handleClose}
          sx={{ width: 130 }}
        >
          {t('general.return')}
        </Button>
      </DialogActions>
    </>
  )
}

export default LoyaltyLevelsModal
