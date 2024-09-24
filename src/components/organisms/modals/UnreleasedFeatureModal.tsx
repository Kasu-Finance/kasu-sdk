import { Button, Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'

const UnreleasedFeatureModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <DialogHeader title={t('general.sorry')} onClose={handleClose} />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        <Stack alignItems='center' spacing={3}>
          <Typography variant='baseMd'>
            {t('modals.unreleasedFeature.message')}
          </Typography>
          <Button
            variant='contained'
            color='dark'
            sx={{ maxWidth: 180 }}
            fullWidth
            onClick={handleClose}
          >
            {t('modals.unreleasedFeature.action')}
          </Button>
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default UnreleasedFeatureModal
