const isFulfilledPromise = <T>(
  promise: PromiseSettledResult<T>
): promise is PromiseFulfilledResult<T> => {
  return promise.status === 'fulfilled'
}

export default isFulfilledPromise
