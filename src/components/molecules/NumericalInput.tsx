import {
  Button,
  FilledInput,
  FormControl,
  FormControlProps,
  Input,
  InputLabel,
  OutlinedInput,
} from '@mui/material'
import { useId } from 'react'

import { escapeRegExp } from '@/utils'

type NumericalInputProps = {
  formControlProps: FormControlProps
  decimals?: number
  amount: string
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
  formControlProps,
  decimals = 18,
  amount,
  setAmount,
  handleMax,
}) => {
  const uuid = useId()

  const id = `deposit-input-${uuid}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value === '' || INPUT_REGEX(decimals).test(escapeRegExp(value))) {
      setAmount(e.target.value)
    }
  }

  const endAdornment = handleMax ? (
    <Button onClick={handleMax}>Max</Button>
  ) : undefined

  const inputPropsBase = {
    id,
    value: amount,
    endAdornment,
    onChange: handleChange,
    sx: {
      pr:
        endAdornment && formControlProps.variant === 'outlined' ? 0 : undefined,
    },
  }

  return (
    <FormControl
      fullWidth={formControlProps.fullWidth ?? true}
      variant={formControlProps.variant ?? 'outlined'}
      {...formControlProps}
    >
      <InputLabel htmlFor={id}>Amount</InputLabel>
      {formControlProps.variant === 'standard' ? (
        <Input {...inputPropsBase} />
      ) : formControlProps.variant === 'filled' ? (
        <FilledInput {...inputPropsBase} />
      ) : (
        <OutlinedInput label='Amount' {...inputPropsBase} />
      )}
    </FormControl>
  )
}

export default NumericalInput
