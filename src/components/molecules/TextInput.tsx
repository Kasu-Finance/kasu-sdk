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

type TextInputProps = {
  amount: string
  setAmount: (amount: string) => void
  handleMax?: () => void
  formControlProps: FormControlProps
}

const TextInput: React.FC<TextInputProps> = ({
  formControlProps,
  amount,
  setAmount,
  handleMax,
}) => {
  const uuid = useId()

  const id = `deposit-input-${uuid}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
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

export default TextInput
