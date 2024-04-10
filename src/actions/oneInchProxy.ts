'use server'

/**
 *
 * ONEINCH_API_KEY - api key for 1inch must be set.
 * ONEINCH_BASE_URI - base uri for 1inch api.
 *
 * @param oneinchQueryParameters
 * @returns 1inch response
 */
const oneInchProxy = async (oneinchQueryParameters: string) => {
  const baseUri = process.env.ONEINCH_BASE_URI ?? 'https://api.1inch.dev'
  const apiKey = process.env.ONEINCH_API_KEY
  if (!apiKey) {
    throw new Error('ArgumentException: apiKey')
  }
  try {
    const response = await fetch(`${baseUri}/${oneinchQueryParameters}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    })

    const data: string = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}

export default oneInchProxy
