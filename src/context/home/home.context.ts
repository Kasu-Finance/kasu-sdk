import { createContext } from 'react'

import { HomeTypes } from '@/context/home/home.types'

const homeContext = createContext({} as HomeTypes)
homeContext.displayName = 'Home'

export default homeContext
