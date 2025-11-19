export const getRequiredEnv = (key: keyof NodeJS.ProcessEnv) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is not configured.`)
  }

  return value
}
