import { Box, Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'
import RequestOverview from '@/components/organisms/modals/RequestDetailsModal/RequestOverview'
import SubsequentTransactions from '@/components/organisms/modals/RequestDetailsModal/SubsequentTransactions'

const RequestDetailsModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.requestDetails.title')}
        onClose={handleClose}
      />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        <Stack spacing={5}>
          <Box>
            <Typography variant='baseMd' textTransform='capitalize'>
              {t('general.lendingStrategy')}
            </Typography>
            <Typography variant='h4'>Lending Strategy Name</Typography>
          </Box>
          <Box>
            <Typography variant='baseMd'>{t('general.request')}</Typography>
            <Typography variant='h4'>
              Lending Request - Mezzanine Tranche
            </Typography>
          </Box>
          <RequestOverview />
          <SubsequentTransactions />
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default RequestDetailsModal
