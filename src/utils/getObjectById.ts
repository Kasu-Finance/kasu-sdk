interface HasId {
  id: string
  [key: string]: any
}

const getObjectById = <T extends HasId>(
  array: T[] | undefined,
  id: string
): T | undefined => {
  if (array) {
    return array.find((item) => item.id === id)
  } else return undefined
}

export default getObjectById
