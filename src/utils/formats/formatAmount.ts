type OptionsParam = {
  minDecimals?: number
  maxDecimals?: number
  minValue?: number
  currency?: 'USD' | ''
  symbol?: string
  useGrouping?: boolean
  hideTrailingZero?: boolean
  roundingScale?: 'K' | 'M' | 'auto' | null
}
const formatAmount = (
  value: number | string,
  options: OptionsParam = {}
): string => {
  const {
    minDecimals = 2,
    currency = '',
    useGrouping = true,
    hideTrailingZero = false,
    symbol,
    roundingScale = null, // Default rounding scale is null, indicating no scaling
  }: OptionsParam = options

  let { maxDecimals = 2 } = options

  if (value === undefined || Number.isNaN(Number(value))) {
    console.warn('formatAmount: Invalid input, expected a number.')
    return '0.00'
  }

  if (minDecimals > maxDecimals) {
    console.error(
      'formatAmount: minDecimals cannot be greater than maxDecimals'
    )
    maxDecimals = minDecimals
  }

  let numValue = Number(value)
  let suffix = ''
  const scaledAndSuffixApplied =
    roundingScale === 'K' || roundingScale === 'M' || roundingScale === 'auto'

  if (roundingScale === 'auto') {
    if (numValue >= 1000000) {
      numValue /= 1000000
      suffix = ' M'
    } else if (numValue >= 1000) {
      numValue /= 1000
      suffix = ' K'
    }
  } else if (roundingScale === 'K') {
    numValue /= 1000
    suffix = ' K'
  } else if (roundingScale === 'M') {
    numValue /= 1000000
    suffix = ' M'
  }

  const format = new Intl.NumberFormat('en-US', {
    ...(currency && { style: 'currency', currency }),
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
    // @ts-ignore typescript hasn't added this
    trailingZeroDisplay: hideTrailingZero ? 'stripIfInteger' : 'auto',
    useGrouping,
  })

  if (!scaledAndSuffixApplied) {
    const joinedFormat = format
      .formatToParts(numValue)
      .map((part) => (part.type === 'compact' ? ` ${part.value}` : part.value))
      .reduce((string, part) => `${string}${part}`)

    return `${joinedFormat} ${symbol ?? ''}`.trim()
  } else {
    const formattedValue = format.format(numValue)
    return `${formattedValue}${suffix} ${symbol ?? ''}`.trim()
  }
}

export default formatAmount
