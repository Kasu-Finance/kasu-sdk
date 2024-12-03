import { Button, Typography } from '@mui/material'
import { Stack } from '@mui/system'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

const MissingEmailModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.missingEmail.title')}
        onClose={handleClose}
      />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        <Stack alignItems='center' spacing={3}>
          <Typography variant='baseMdBold'>
            {t('modals.missingEmail.description-1')}{' '}
            <Typography variant='baseMd'>
              {t('modals.missingEmail.description-2')}
            </Typography>
          </Typography>
          <Button
            variant='contained'
            color='dark'
            fullWidth
            onClick={handleClose}
            sx={{ textTransform: 'capitalize' }}
          >
            {t('general.close')}
          </Button>
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default MissingEmailModal
