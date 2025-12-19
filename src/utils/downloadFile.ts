const getFilenameFromContentDisposition = (
  contentDisposition: string | null
): string | undefined => {
  if (!contentDisposition) return undefined

  const filenameStar = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (filenameStar?.[1]) {
    try {
      return decodeURIComponent(filenameStar[1])
    } catch {
      return filenameStar[1]
    }
  }

  const filename = contentDisposition.match(/filename="?([^";]+)"?/i)
  return filename?.[1]
}

export const downloadBlob = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(objectUrl)
}

export const downloadFromApi = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const message = await res.text().catch(() => '')
    throw new Error(message || `CSV download failed (${res.status})`)
  }

  const blob = await res.blob()

  const filename =
    getFilenameFromContentDisposition(res.headers.get('content-disposition')) ??
    'download.csv'

  downloadBlob(blob, filename)
}
