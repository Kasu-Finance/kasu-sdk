type OptionsParam = {
  minDecimals?: number
  maxDecimals?: number
  minValue?: number
  currency?: 'USD' | ''
  useGrouping?: boolean
}

// important:: sort by number value desc
const FORMATS = [
  {
    number: 1_000_000_000,
    formatLabel: 'B',
  },
  {
    number: 1_000_000,
    formatLabel: 'M',
  },
  {
    number: 1000,
    formatLabel: 'K',
  },
] as const

const formatAmount = (
  value: number | string,
  options: OptionsParam
): string => {
  const {
    minDecimals = 0,
    minValue,
    currency = '',
    useGrouping = true,
  } = options

  let { maxDecimals = 2 } = options

  if (!value && value !== 0) {
    console.warn('formatAmount: Value is not defined')
    value = 0
  }

  if (isNaN(Number(value))) {
    console.warn('formatAmount: Value is not a number')
    value = 0
  }

  if (minDecimals > maxDecimals) {
    console.error(
      'formatAmount: minDecimals cannot be greater than maxDecimals'
    )
    maxDecimals = minDecimals
  }

  let parsedValue = Number(value)

  let format: (typeof FORMATS)[number] | undefined

  if (minValue && parsedValue > minValue) {
    format = FORMATS.find((format) => Math.abs(parsedValue) > format.number)

    if (format) {
      parsedValue = parsedValue / format.number
    }
  }

  const output = parsedValue.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
    ...(currency && { style: 'currency', currency }),
    useGrouping,
  })

  return `${output}${format?.formatLabel ?? ''}`
}

export default formatAmount
