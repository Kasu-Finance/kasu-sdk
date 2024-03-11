const getInitials = (name: string, initialsCount: number = 2): string => {
  const cleanedName = name.trim().replace(/\s+/g, ' ')

  if (cleanedName === '') {
    console.warn('String is empty')
    return 'N/A'
  }

  const nameParts = cleanedName.split(' ')

  let initials = ''
  if (nameParts.length === 1) {
    if (cleanedName.length < initialsCount) {
      console.warn('String too short to extract the desired number of initials')
    }
    initials = cleanedName.substring(0, initialsCount).toUpperCase()
  } else {
    initials = nameParts
      .filter(Boolean)
      .slice(0, initialsCount)
      .map((part) => part[0].toUpperCase())
      .join('')

    if (initials.length < initialsCount) {
      console.warn('String too short to extract the desired number of initials')
    }
  }

  return initials
}

export default getInitials
