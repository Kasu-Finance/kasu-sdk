import { Box, Button, Typography, useTheme } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import AmountInput from '@/components/molecules/lending/WithdrawModal/RequestForm/AmountInput'
import TrancheSelect from '@/components/molecules/lending/WithdrawModal/RequestForm/TrancheSelect'

import { ChevronRightIcon } from '@/assets/icons'

import { Tranche } from '@/constants'

interface RequestFormProps {
  amount: string
  selectedTranche: Tranche
  errorMsg: string
  isMultiTranche: boolean
  containerClassName?: string
  onSubmit: () => void
  setErrorMsg: (msg: string) => void
  setAmount: (amount: string) => void
  setSelectedTranche: (tranche: Tranche) => void
}

const RequestForm: React.FC<RequestFormProps> = ({
  amount,
  selectedTranche,
  errorMsg,
  isMultiTranche,
  containerClassName,
  onSubmit,
  setErrorMsg,
  setAmount,
  setSelectedTranche,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
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

      {isMultiTranche && (
        <TrancheSelect
          selectedTranche={selectedTranche}
          setSelectedTranche={setSelectedTranche}
        />
      )}

      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        width='100%'
        mt={3}
      >
        <Button
          variant='contained'
          endIcon={
            <ChevronRightIcon
              color={
                disabledButton
                  ? 'rgba(0, 0, 0, 0.26)'
                  : theme.palette.common.white
              }
            />
          }
          onClick={onSubmit}
          disabled={disabledButton}
        >
          {t('lending.withdraw.button.review')}
        </Button>
      </Box>
    </Box>
  )
}

export default RequestForm
