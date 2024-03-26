/**
 * Pauses execution for the provided number of milliseconds.
 *
 * @param ms - The number of milliseconds to pause for.
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default sleep
