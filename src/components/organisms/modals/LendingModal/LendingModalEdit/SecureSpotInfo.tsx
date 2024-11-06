import { Box, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const SecureSpotInfo = () => {
  const { t } = getTranslation()

  return (
    <Box bgcolor='gold.dark' borderRadius={2} p={2}>
      <Typography variant='h5' textAlign='center' mb={1.5} color='white'>
        {t('modals.lending.secure-spot.title')}
      </Typography>
      <Typography variant='baseSm' textAlign='center' display='block'>
        {t('modals.lending.secure-spot.description')}
      </Typography>
    </Box>
  )
}

export default SecureSpotInfo
