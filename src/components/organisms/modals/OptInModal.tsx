import { Button, Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

const OptInModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <DialogHeader title={t('modals.optIn.title')} onClose={handleClose} />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        <Stack alignItems='center' spacing={3}>
          <Typography variant='baseMd'>
            {t('modals.optIn.description')}
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

export default OptInModal
