'use client'

const ClientError: React.FC<{ error: Error | string | null }> = ({ error }) => {
  console.error('SERVER ERROR:', error)

  return null
}

export default ClientError
