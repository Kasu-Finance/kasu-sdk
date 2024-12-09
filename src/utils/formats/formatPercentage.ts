const formatPercentage = (value: string | number, decimals?: number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  if (numericValue === 0) {
    return '0.00 %'
  }

  return `${(numericValue * 100).toFixed(decimals ?? 2)} %`
}

export default formatPercentage
