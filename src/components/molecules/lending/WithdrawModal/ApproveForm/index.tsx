import { Box, Button, Divider, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CountdownSection from '@/components/molecules/lending/WithdrawModal/ApproveForm/CountdownSection'

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
    <Box mt={3} pl={1} pr={1}>
      <Typography variant='subtitle2' color='textPrimary' mb={0.5}>
        {t('lending.withdraw.epochEnds')}
      </Typography>
      <Divider />
      <CountdownSection />

      <Box display='flex' flexDirection='column' alignItems='center' mt={2}>
        <Box width='70%' textAlign='center'>
          <Typography variant='body2'>
            {t('lending.withdraw.withdrawalSchedule')}
          </Typography>
        </Box>

        <Box display='flex' justifyContent='center' mt={2}>
          <Button
            variant='outlined'
            startIcon={<EditIcon />}
            onClick={handleAdjust}
          >
            {t('lending.withdraw.button.adjust')}
          </Button>

          <Button
            sx={{ ml: 2 }}
            variant='contained'
            endIcon={<ChevronRightIcon />}
            onClick={onSubmit}
          >
            {t('lending.withdraw.button.confirm')}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default ApproveForm
