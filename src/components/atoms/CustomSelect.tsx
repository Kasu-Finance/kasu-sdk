'use client'

import {
  Box,
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SxProps,
  Theme,
  Typography,
} from '@mui/material'
import { SelectInputProps } from '@mui/material/Select/SelectInput'
import { ReactNode, useId, useState } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'

import { customTypography } from '@/themes/typography'

type CustomSelectProps<
  OptionKey extends string | number | symbol,
  OptionValue,
  Option extends Record<OptionKey, OptionValue>,
  TValue extends OptionValue,
> = {
  label: string
  value: TValue
  onChange: SelectInputProps<TValue>['onChange']
  options: Option[]
  valueKey: OptionKey
  labelKey: OptionKey
  maxWidth?: number
  formControlProps?: FormControlProps
  selectSx?: SxProps<Theme>
  variant?: 'primary' | 'secondary'
  renderItem?: (val: Option) => ReactNode
  renderSelected?: (val: Option | undefined) => ReactNode
}

const CustomSelect = <
  OptionKey extends string | number | symbol,
  OptionValue,
  Option extends Record<OptionKey, OptionValue>,
  TValue extends OptionValue,
>({
  label,
  value,
  onChange,
  options,
  labelKey,
  valueKey,
  maxWidth,
  formControlProps,
  selectSx,
  variant = 'primary',
  renderItem,
  renderSelected,
}: CustomSelectProps<OptionKey, OptionValue, Option, TValue>) => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const uuid = useId()

  return (
    <FormControl
      fullWidth={true}
      {...formControlProps}
      sx={[
        {
          maxWidth,
          '.MuiSelect-select.MuiOutlinedInput-input': {
            height: 48,
            display: 'flex',
            alignItems: 'center',
          },
        },
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
          color: variant === 'secondary' ? 'white' : undefined,
          '&.Mui-focused': {
            color: variant === 'secondary' ? 'white' : undefined,
          },
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
        onOpen={handleOpen}
        onClose={handleClose}
        value={value}
        displayEmpty
        sx={[
          {
            borderRadius: 50,
            '.MuiOutlinedInput-notchedOutline': {
              borderRadius: 50,
              borderColor: variant === 'secondary' ? 'white' : undefined,
              legend: {
                ...customTypography.baseMd,
                fontSize: `calc(${customTypography.baseMd.fontSize}px * 0.75)`,
                ml: 1,
              },
            },
          },
          ...(Array.isArray(selectSx) ? selectSx : [selectSx]),
        ]}
        inputProps={{
          id: uuid,
          sx: {
            borderRadius: 50,
            bgcolor: variant === 'secondary' ? 'gold.middle' : undefined,
            height: 48,
            boxSizing: 'border-box',
          },
        }}
        onChange={onChange}
        input={
          <OutlinedInput
            sx={{
              '.MuiOutlinedInput-notchedOutline': {
                background: 'blue',
              },
            }}
            label={label}
          />
        }
        renderValue={(val) => {
          const option = options.find((option) => option[valueKey] === val)

          return renderSelected ? (
            renderSelected(option)
          ) : option ? (
            <Typography
              maxWidth={maxWidth}
              whiteSpace='nowrap'
              overflow='hidden'
              textOverflow='ellipsis'
              component='span'
              py={1}
            >
              {option[labelKey] as string}
            </Typography>
          ) : null
        }}
      >
        {options.map((option, index, originalArray) => (
          <MenuItem
            key={index}
            value={option[valueKey] as string}
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
            {renderItem ? (
              <>
                {renderItem(option)}
                {index !== originalArray.length - 1 && <DottedDivider />}
              </>
            ) : (
              <>
                <Typography
                  maxWidth={maxWidth}
                  whiteSpace='wrap'
                  component='span'
                  py={1}
                >
                  {option[labelKey] as string}
                </Typography>
                {index !== originalArray.length - 1 && <DottedDivider />}
              </>
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default CustomSelect
