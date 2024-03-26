import { Box, Button, Divider, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CountdownSection from '@/components/organisms/modals/WithdrawModal/ApproveForm/CountdownSection'

import { ChevronRightIcon, EditIcon } from '@/assets/icons'

interface ApproveFormProps {
  handleAdjust: () => void
  onSubmit: () => void
}

const ApproveForm: React.FC<ApproveFormProps> = ({
  handleAdjust,
  onSubmit,
}) => {
  const { t } = useTranslation()

  return (
    <Box mt={3} px={1}>
      <Typography variant='subtitle2' color='textPrimary' mb={0.5}>
        {t('lending.withdraw.epochEnds')}
      </Typography>
      <Divider />
      <CountdownSection />

      <Box display='flex' flexDirection='column' alignItems='center' mt={2}>
        <Typography variant='body2' width='70%' textAlign='center' mb={2}>
          {t('lending.withdraw.withdrawalSchedule')}
        </Typography>

        <Box display='flex' justifyContent='center'>
          <Button
            variant='outlined'
            startIcon={<EditIcon />}
            onClick={handleAdjust}
            sx={{ mr: 2, fontSize: '15px' }}
          >
            {t('lending.withdraw.button.adjust')}
          </Button>

          <Button
            variant='contained'
            endIcon={<ChevronRightIcon />}
            onClick={onSubmit}
            sx={{ fontSize: '15px' }}
          >
            {t('lending.withdraw.button.confirm')}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default ApproveForm
