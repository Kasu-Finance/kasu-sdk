import { Box, Button, Divider, Typography } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { useRouter } from 'next/navigation'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import CountdownSection from '@/components/organisms/modals/WithdrawModal/ApproveForm/CountdownSection'

import { ModalsKeys } from '@/context/modal/modal.types'
import { WithdrawProgress } from '@/context/withdrawModal/withdrawModal.types'

import { ChevronRightIcon, EditIcon } from '@/assets/icons'

import { Routes } from '@/config/routes'

interface ApproveFormProps {
  pool: PoolOverview
}

const ApproveForm: React.FC<ApproveFormProps> = ({ pool }) => {
  const { setWithdrawProgress, setProcessing } = useWithdrawModalState()
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const router = useRouter()

  const onSubmit = () => {
    setProcessing(true)
    openModal({ name: ModalsKeys.TRANSACTION_PROCESSING })

    setTimeout(() => {
      setProcessing(false)
      setWithdrawProgress(WithdrawProgress.CONFIRM)
      router.push(`${Routes.lending.root.url}?poolId=${pool?.id}&step=3`)
    }, 2000)
  }

  const handleAdjust = () => {
    setWithdrawProgress(WithdrawProgress.REQUEST)
    router.push(`${Routes.lending.root.url}?poolId=${pool?.id}&step=1`)
  }

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
