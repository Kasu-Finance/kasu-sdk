const splitTextIntoRows = (text: string, maxCharsPerRow: number): string[] => {
  const result: string[] = []
  let currentIndex = 0

  while (currentIndex < text.length) {
    let endIndex = Math.min(currentIndex + maxCharsPerRow, text.length)

    if (endIndex < text.length && text[endIndex] !== ' ') {
      const lastSpaceIndex = text.lastIndexOf(' ', endIndex)
      if (lastSpaceIndex > currentIndex) {
        endIndex = lastSpaceIndex
      }
    }

    result.push(text.substring(currentIndex, endIndex).trim())
    currentIndex = endIndex + 1
  }

  return result
}

export default splitTextIntoRows
