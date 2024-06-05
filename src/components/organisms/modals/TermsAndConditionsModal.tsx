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

const TermsAndConditionsModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <DialogHeader
        title={t('modals.termsAndConditions.title')}
        onClose={handleClose}
      />
      <DialogContent sx={{ px: 3, py: 1 }}>
        <Box display='grid' gap={2}>
          <Typography variant='h6' component='span' display='block'>
            {t('modals.loyaltyLevels.subtitle')}
          </Typography>
          <Typography variant='subtitle2' component='p'>
            {t('modals.termsAndConditions.description-1')}
          </Typography>
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.description-2')}
          </Typography>
          <LoyaltyLevelInfo
            title={t('locking.widgets.loyalty.level.level-1.title')}
            subtitle={t(
              'modals.termsAndConditions.loyalty-level-0.description-1'
            )}
            list={[
              t('modals.termsAndConditions.loyalty-level-0.list.list-0'),
              t('modals.termsAndConditions.loyalty-level-0.list.list-1'),
              t('modals.termsAndConditions.loyalty-level-0.list.list-2'),
            ]}
          />
          <LoyaltyLevelInfo
            title={t('locking.widgets.loyalty.level.level-1.title')}
            subtitle={t(
              'modals.termsAndConditions.loyalty-level-1.description-1'
            )}
            list={[
              t('modals.termsAndConditions.loyalty-level-1.list.list-0'),
              t('modals.termsAndConditions.loyalty-level-1.list.list-1'),
              t('modals.termsAndConditions.loyalty-level-1.list.list-2'),
            ]}
          />
          <LoyaltyLevelInfo
            title={t('locking.widgets.loyalty.level.level-2.title')}
            subtitle={t(
              'modals.termsAndConditions.loyalty-level-2.description-1'
            )}
            list={[
              t('modals.termsAndConditions.loyalty-level-2.list.list-0'),
              t('modals.termsAndConditions.loyalty-level-2.list.list-1'),
              t('modals.termsAndConditions.loyalty-level-2.list.list-2'),
            ]}
          />
          <Typography variant='body2' component='p'>
            {t('modals.termsAndConditions.description-3')}
          </Typography>
        </Box>
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

export default TermsAndConditionsModal
