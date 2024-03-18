const splitDateAndTime = (
  dateTime: string
): { date: string; utcOffset: string } => {
  const parts = dateTime.split(' ')
  const date = parts.slice(0, -2).join(' ')
  const utcOffset = parts.slice(-2).join(' ')

  return {
    date: date.trim(),
    utcOffset: utcOffset.trim(),
  }
}

export default splitDateAndTime
