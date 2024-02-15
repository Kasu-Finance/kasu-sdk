type OptionsParam = {
  minDecimals?: number
  maxDecimals?: number
  minValue?: number
  currency?: 'USD' | ''
  symbol?: string
  useGrouping?: boolean
}

const formatAmount = (
  value: number | string,
  options: OptionsParam = {}
): string => {
  const {
    minDecimals = 0,
    minValue,
    currency = '',
    useGrouping = true,
    symbol,
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

  const formatWithSuffix = Boolean(minValue && minValue > +value)

  const format = new Intl.NumberFormat('en-US', {
    ...(currency && { style: 'currency', currency }),
    ...(formatWithSuffix && { notation: 'compact', compactDisplay: 'short' }),
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
    // @ts-ignore typescript hasn't added this
    trailingZeroDisplay: 'stripIfInteger',
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
