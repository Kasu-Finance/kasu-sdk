type OptionsParam = {
  minDecimals?: number
  maxDecimals?: number
  minValue?: number
  currency?: 'USD' | ''
  symbol?: string
  useGrouping?: boolean
  hideTrailingZero?: boolean
}

const formatAmount = (
  value: number | string,
  options: OptionsParam = {}
): string => {
  const {
    minDecimals = 2,
    minValue,
    currency = '',
    useGrouping = true,
    hideTrailingZero = false,
    symbol,
  } = options

  let { maxDecimals = 2 } = options

  if (value === undefined || isNaN(Number(value)) || !isFinite(Number(value))) {
    console.warn('formatAmount: Invalid input, expected a number.')
    return '0.00'
  }

  if (minDecimals > maxDecimals) {
    console.error(
      'formatAmount: minDecimals cannot be greater than maxDecimals'
    )
    maxDecimals = minDecimals
  }

  const formatWithSuffix = Boolean(minValue && +value > minValue)

  const format = new Intl.NumberFormat('en-US', {
    ...(currency && { style: 'currency', currency }),
    ...(formatWithSuffix && { notation: 'compact', compactDisplay: 'short' }),
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
    // @ts-ignore typescript hasn't added this
    trailingZeroDisplay: hideTrailingZero ? 'stripIfInteger' : 'auto',
    useGrouping,
  })

  if (!formatWithSuffix) return `${format.format(+value)} ${symbol ?? ''}`

  // adds spacing to "compact part" e.g "K" -> " K"
  const joinedFormat = format
    .formatToParts(+value)
    .map((parts) =>
      parts.type === 'compact' ? ` ${parts.value}` : parts.value
    )
    .reduce((string, part) => `${string}${part}`)

  return `${joinedFormat} ${symbol ?? ''}`
}

export default formatAmount
