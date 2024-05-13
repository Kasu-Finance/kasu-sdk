const isLocalhost = (): boolean => {
  // Check if the result is already stored in localStorage
  const storedResult = localStorage.getItem('isLocalhost')
  if (storedResult !== null) {
    return storedResult === 'true'
  }

  // Compute the result if not stored
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  const result =
    (hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]') &&
    protocol === 'https:'

  // Store the result in localStorage
  localStorage.setItem('isLocalhost', result.toString())

  return result
}

export default isLocalhost
