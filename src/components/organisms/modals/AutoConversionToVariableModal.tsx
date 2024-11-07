import { Button, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

const AutoConversionToVariableModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.autoConversionToVariable.title')}
        onClose={handleClose}
      />
      <DialogContent>
        <Stack spacing={3}>
          <Typography variant='baseMd'>
            {t('modals.autoConversionToVariable.description').replace(
              '{{ epoch }}',
              '4'
            )}
          </Typography>
          <Button
            variant='contained'
            color='secondary'
            fullWidth
            sx={{ textTransform: 'capitalize' }}
            onClick={handleClose}
          >
            {t('general.close')}
          </Button>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default AutoConversionToVariableModal
