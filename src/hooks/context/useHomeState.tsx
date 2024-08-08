import { useContext } from 'react'

import homeContext from '@/context/home/home.context'
import { HomeTypes } from '@/context/home/home.types'

const useHomeState = (): HomeTypes => {
  const context = useContext(homeContext)

  if (!Object.keys(context).length) {
    throw new Error('HomeContext must be used within its provider')
  }

  return context
}

export default useHomeState
