export type LoadingMaskState = {
  isOpen: boolean
  message?: string
}

export type LoadingMaskActions =
  | { type: 'SHOW'; message?: string }
  | { type: 'HIDE' }

export type LoadingMaskFunctions = {
  showLoadingMask: (message?: string) => void
  hideLoadingMask: () => void
}

export type LoadingMaskTypes = LoadingMaskState & LoadingMaskFunctions
