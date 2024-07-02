class FetchError extends Error {
  originalError: any

  constructor(message: string, originalError: any) {
    super(message)
    this.name = 'FetchError'
    this.originalError = originalError
  }
}

// Define the ongoingRequests cache at module scope
const ongoingRequests: Record<string, Promise<Response> | undefined> = {}

const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  delay: number = 1000,
  simulateError: boolean = false
): Promise<Response> => {
  // Check if there is an ongoing request for the same URL
  if (ongoingRequests[url]) {
    console.warn(`Reusing ongoing request for URL: ${url}`)
    return ongoingRequests[url]!
  }

  // Function to actually perform the fetch
  const executeFetch = async (): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        // Simulate a 500 error if simulateError is true
        if (simulateError) {
          console.error(
            `Simulating 500 error for URL: ${url}, attempt: ${i + 1}`
          )
          const mockResponse = new Response(null, { status: 500 })
          throw new FetchError('Simulated 500 error', mockResponse)
        }

        const response: Response = await fetch(url, options)

        if (response.status >= 500 && response.status < 600) {
          console.warn(`Retrying request for URL: ${url}, attempt: ${i + 1}`)
          await new Promise((res) => setTimeout(res, delay))
        } else {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response
        }
      } catch (error) {
        if (i === retries - 1) {
          console.error(
            `Failed to fetch after multiple attempts for URL: ${url}`
          )
          throw new FetchError('Failed to fetch after multiple attempts', error)
        }
        console.error(`Retrying request for URL: ${url}, attempt: ${i + 1}`)
        await new Promise((res) => setTimeout(res, delay))
      }
    }
    throw new FetchError(
      'Exhausted all retries without success',
      new Error('Retries exhausted')
    )
  }

  // Store the ongoing request in the cache
  const fetchPromise = executeFetch().finally(() => {
    // Remove the request from the cache once it is complete
    delete ongoingRequests[url]
  })

  ongoingRequests[url] = fetchPromise

  return fetchPromise
}

export default fetchWithRetry
