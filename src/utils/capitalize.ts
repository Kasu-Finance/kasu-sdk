const capitalize = (str: string) =>
  str
    .split(' ')
    .map((parts) => `${parts[0].toUpperCase()}${parts.slice(1).toLowerCase()}`)
    .join(' ')

export default capitalize
