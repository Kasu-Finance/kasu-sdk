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

import useTranslation from '@/hooks/useTranslation'

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
  const { t } = useTranslation()
  const tAmount =
    t('general.amount').charAt(0).toUpperCase() + t('general.amount').slice(1)
  const id = `deposit-input-${uuid}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  const endAdornment = handleMax ? (
    <Button sx={{ textTransform: 'capitalize' }} onClick={handleMax}>
      {t('general.max')}
    </Button>
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
      <InputLabel htmlFor={id}> {tAmount}</InputLabel>
      {formControlProps.variant === 'standard' ? (
        <Input {...inputPropsBase} />
      ) : formControlProps.variant === 'filled' ? (
        <FilledInput {...inputPropsBase} />
      ) : (
        <OutlinedInput label={tAmount} {...inputPropsBase} />
      )}
    </FormControl>
  )
}

export default TextInput
