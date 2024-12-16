import { Box, Button, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'

import { Routes } from '@/config/routes'

const WithdrawalScheduleInfo = () => {
  const { t } = getTranslation()

  return (
    <Box
      bgcolor='gold.dark'
      borderRadius={2}
      py={2}
      px={3.5}
      textAlign='center'
    >
      <Stack spacing={2}>
        <Typography variant='baseSm' component='p'>
          {t('modals.withdrawal.schedule.description-1')}{' '}
          <Button
            variant='text'
            sx={{
              p: 0,
              height: 'auto',
              textTransform: 'unset',
              font: 'inherit',
              verticalAlign: 'inherit',
              display: 'inline',
              color: 'white',
            }}
            href={Routes.lending.termsAndConditions.url}
            target='_blank'
            style={{ font: 'inherit', color: 'white' }}
          >
            {t('modals.termsAndConditions.title')}
          </Button>{' '}
          {t('modals.withdrawal.schedule.description-2')}
        </Typography>
        <Typography variant='baseSm' component='p'>
          {t('modals.withdrawal.schedule.description-3')}
        </Typography>
        <NextClearingPeriodInfo sx={{ p: 0 }} />
      </Stack>
    </Box>
  )
}

export default WithdrawalScheduleInfo
