const mergeSubheading = (poolName: string, subheading?: string) => {
  if (!subheading) return poolName

  return `${poolName} - ${subheading}`
}

export default mergeSubheading
