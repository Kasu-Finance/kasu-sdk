import { Box, Button, TextField, TextFieldProps } from '@mui/material'
import { useId } from 'react'

import useTranslation from '@/hooks/useTranslation'

import { capitalize, escapeRegExp } from '@/utils'

type NumericalInputProps = {
  rootProps?: TextFieldProps
  label?: string
  decimals?: number
  amount: string
  placeholder?: string
  disabled?: boolean
  setAmount: (amount: string) => void
  handleMax?: () => void
}

// JavaScript uses \ as an escape on the language level
// so the following regex actually translates into
// RegExp(`^\d*(?:\\\\[.])?\d*$`)

// string has to start with N amount of numbers between 0 and 9
// can contain \\. only once or nothing at all, cannot contain \. or \ or . or \\
// can be followed by N amount of numbers between 0 and 9 if above statement matches
// string should end after the above statement
const INPUT_REGEX = (decimals?: number) => {
  const preventOverflow = decimals !== undefined

  const endRegex = preventOverflow ? `{0,${decimals}}` : '*'

  return RegExp(`^\\d*(?:\\\\[.])?\\d${endRegex}$`)
}

const NumericalInput: React.FC<NumericalInputProps> = ({
  rootProps,
  label,
  decimals = 18,
  amount,
  placeholder = '0.00',
  disabled,
  setAmount,
  handleMax,
}) => {
  const uuid = useId()
  const { t } = useTranslation()
  const inputLabel = label ?? capitalize(t('general.amount'))
  const id = `deposit-input-${uuid}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // adding `.` here because we don't want the digit to start with "." without preceeding a 0 even if its a valid number
    if (value !== '.' && INPUT_REGEX(decimals).test(escapeRegExp(value))) {
      setAmount(value)
    }
  }

  const maxButton = handleMax ? (
    <Button
      variant='outlined'
      sx={{ textTransform: 'uppercase', height: '56px', width: '56px' }}
      onClick={handleMax}
      size='large'
      disabled={disabled}
    >
      {t('general.max')}
    </Button>
  ) : undefined

  return (
    <Box display='flex' gap={1} alignItems='end'>
      <TextField
        value={amount}
        onChange={handleChange}
        fullWidth
        label={inputLabel}
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        {...rootProps}
      />
      {maxButton}
    </Box>
  )
}

export default NumericalInput
