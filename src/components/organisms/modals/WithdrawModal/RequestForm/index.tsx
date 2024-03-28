import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Box, Button, Typography, useTheme } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { useRouter } from 'next/navigation'
import React from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

import AmountInput from '@/components/organisms/modals/WithdrawModal/RequestForm/AmountInput'
import TrancheSelect from '@/components/organisms/modals/WithdrawModal/RequestForm/TrancheSelect'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { Routes } from '@/config/routes'

interface RequestFormProps {
  poolData: PoolOverview
  isMultiTranche: boolean
  containerClassName?: string
}

const RequestForm: React.FC<RequestFormProps> = ({
  poolData,
  isMultiTranche,
  containerClassName,
}) => {
  const { amount, errorMsg, setAmount, setErrorMsg } = useWithdrawModalState()
  const { setModalStatusAction } = useModalStatusState()

  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()

  const handleSubmit = () => {
    setModalStatusAction(ModalStatusAction.APPROVE)
    router.push(`${Routes.lending.root.url}?poolId=${poolData?.id}&step=2`)
  }

  const disabledButton = !amount || !!errorMsg

  return (
    <Box pt={3} pl={1} pr={1} className={containerClassName}>
      <Typography variant='subtitle1' mb={0.5}>
        {t('lending.withdraw.subtitle')}
      </Typography>

      <AmountInput
        amount={amount}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        setAmount={setAmount}
      />

      {isMultiTranche && <TrancheSelect poolData={poolData} />}

      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        width='100%'
        mt={3}
      >
        <Button
          variant='contained'
          sx={{ fontSize: '15px' }}
          endIcon={
            <ChevronRightIcon
              sx={{
                mt: '2px',
                width: '24px',
                height: '24px',
                color: disabledButton
                  ? 'rgba(0, 0, 0, 0.26)'
                  : theme.palette.common.white,
              }}
            />
          }
          onClick={handleSubmit}
          disabled={disabledButton}
        >
          {t('lending.withdraw.button.review')}
        </Button>
      </Box>
    </Box>
  )
}

export default RequestForm
