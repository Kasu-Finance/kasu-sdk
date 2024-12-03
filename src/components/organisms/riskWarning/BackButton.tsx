'use client'

import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'

import getTranslation from '@/hooks/useTranslation'

const BackButton = () => {
  const { t } = getTranslation()

  const router = useRouter()

  const handleClick = () => {
    if (window.history?.length && window.history.length > 1) {
      router.back()
    } else {
      window.close()
    }
  }

  return (
    <Button
      variant='contained'
      sx={{
        maxWidth: 368,
        textTransform: 'capitalize',
        alignSelf: 'center',
      }}
      fullWidth
      onClick={handleClick}
    >
      {t('general.back')}
    </Button>
  )
}

export default BackButton
