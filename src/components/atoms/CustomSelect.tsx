import {
  Box,
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material'
import { SelectInputProps } from '@mui/material/Select/SelectInput'
import { useId, useReducer } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'

type CustomSelectProps<T> = {
  label: string
  value: T
  onChange: SelectInputProps<T>['onChange']
  options: {
    id: string
    name: string
  }[]
  maxWidth?: number
  formControlProps?: FormControlProps
  variant?: 'primary' | 'secondary'
}

const CustomSelect = <T,>({
  label,
  value,
  onChange,
  options,
  maxWidth,
  formControlProps,
  variant = 'primary',
}: CustomSelectProps<T>) => {
  const [open, toggleOpen] = useReducer((prev) => !prev, false)

  const uuid = useId()

  return (
    <FormControl
      fullWidth={true}
      {...formControlProps}
      sx={[
        { maxWidth },
        ...(Array.isArray(formControlProps?.sx)
          ? formControlProps.sx
          : [formControlProps?.sx]),
      ]}
    >
      <InputLabel
        shrink={true}
        htmlFor={uuid}
        sx={(theme) => ({
          ...theme.typography.baseMd,
          ml: 1,
          mt: '1px',
        })}
      >
        {label}
      </InputLabel>
      {open && (
        <Box
          width='100%'
          bgcolor='gray.extraDark'
          height={30}
          position='absolute'
          bottom={-3}
        />
      )}
      <Select
        notched={true}
        onOpen={toggleOpen}
        onClose={toggleOpen}
        value={value}
        inputProps={{
          id: uuid,
        }}
        onChange={onChange}
        SelectDisplayProps={{
          style: {
            paddingLeft: 24,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'block',
          },
        }}
        input={
          <OutlinedInput
            sx={(theme) => ({
              borderRadius: 50,
              bgcolor: variant === 'secondary' ? 'gold.middle' : undefined,
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: variant === 'secondary' ? 'white' : undefined,
                legend: {
                  ...theme.typography.baseXs,
                  ml: 1.5,
                  span: {
                    px: 0.25,
                  },
                },
              },
            })}
            label={label}
          />
        }
      >
        {options.map(({ id, name }, index, originalArray) => (
          <MenuItem
            key={id}
            value={id}
            sx={{
              maxWidth,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              py: 0,
              px: 2,
              color: 'gold.dark',
              '&:focus': {
                bgcolor: 'rgba(196, 153, 108, 0.3)',
                '&::before': {
                  display: 'none',
                },
              },
            }}
          >
            <Typography
              maxWidth={maxWidth}
              whiteSpace='wrap'
              component='span'
              py={1}
            >
              {name}
            </Typography>
            {index !== originalArray.length - 1 && <DottedDivider />}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default CustomSelect
