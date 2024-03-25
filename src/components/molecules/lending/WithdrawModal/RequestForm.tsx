import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from '@mui/material'
import React, { memo, useCallback, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import NumericalInput from '@/components/molecules/NumericalInput'

import { ChevronRightIcon, ExitIcon } from '@/assets/icons'

import { Tranche } from '@/constants'

interface RequestFormProps {
  amount: string
  selectedTranche: Tranche
  errorMsg: string
  isMultiTranche: boolean
  containerClassName?: string
  handleSubmit: () => void
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
  handleSubmit,
  setErrorMsg,
  setAmount,
  setSelectedTranche,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const disabledButton = !amount || !!errorMsg

  const validateAmount = useCallback(
    (input: string) => {
      if (input === '123') {
        // TODO - change this to a valid condition
        setErrorMsg(t('lending.withdraw.errors.invalidCriteria'))
        return false
      } else {
        setErrorMsg('')
        return true
      }
    },
    [t, setErrorMsg]
  )

  const handleAmount = (value: string) => {
    setAmount(value)
    validateAmount(value)
  }

  const handleMax = () => {
    const maxAmount = '100' // TODO - get the max amount
    validateAmount(maxAmount)
    setAmount(maxAmount)
  }

  const handleSelectTranche = (event: SelectChangeEvent) => {
    setSelectedTranche(event.target.value as Tranche)
  }

  const isAmountValid = useMemo(
    () => (amount && validateAmount(amount)) || false,
    [amount, validateAmount]
  )

  const numericalInputRootProps = {
    sx: {
      mt: 1,
      '& .MuiOutlinedInput-root': {
        fieldset: {
          borderColor: isAmountValid ? theme.palette.success.main : '',
        },
      },
      '& .MuiInputLabel-root': {
        color: isAmountValid ? theme.palette.success.main : '',
      },
      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: isAmountValid ? theme.palette.success.main : '',
      },
      '& .MuiInputBase-input': {
        pl: 1,
      },
    },
    error: !!errorMsg,
    InputProps: {
      startAdornment: <ExitIcon />,
      endAdornment: 'USDC',
    },
  }

  return (
    <Box pt={3} pl={1} pr={1} className={containerClassName}>
      <Typography variant='subtitle1' mb={0.5}>
        {t('lending.withdraw.subtitle')}
      </Typography>

      <Box>
        <NumericalInput
          amount={amount}
          handleMax={handleMax}
          setAmount={handleAmount}
          label={t('lending.withdraw.subtitle')}
          rootProps={numericalInputRootProps}
        />
        <Typography
          variant='caption'
          component='span'
          color={theme.palette.error.main}
        >
          {errorMsg}
        </Typography>
      </Box>

      {!isMultiTranche && (
        <Box mt={3}>
          <FormControl fullWidth>
            <InputLabel id='tranche-select'>
              {t('lending.withdraw.dropdown.label')}
            </InputLabel>
            <Select
              value={selectedTranche}
              onChange={handleSelectTranche}
              size='small'
              id='tranche'
              label={t('lending.withdraw.dropdown.label')}
              labelId='tranche-select'
            >
              <MenuItem value={Tranche.SENIOR_TRANCHE}>
                {t('lending.withdraw.dropdown.option.senior')}
              </MenuItem>
              <MenuItem value={Tranche.MEZZANINE_TRANCE}>
                {t('lending.withdraw.dropdown.option.mezzanine')}
              </MenuItem>
              <MenuItem value={Tranche.JUNIOR_TRANCHE}>
                {t('lending.withdraw.dropdown.option.junior')}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
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
          onClick={handleSubmit}
          disabled={disabledButton}
        >
          {t('lending.withdraw.button.review')}
        </Button>
      </Box>
    </Box>
  )
}

export default memo(RequestForm)
