import { memo, useEffect } from 'react'
import { hotjar } from 'react-hotjar'

const Hotjar: React.FC<{ appLoaded: boolean }> = ({ appLoaded }) => {
  useEffect(() => {
    if (appLoaded) hotjar.initialize({ id: 3905131, sv: 6, debug: true })
  }, [appLoaded])

  return null
}

export default memo(Hotjar)
