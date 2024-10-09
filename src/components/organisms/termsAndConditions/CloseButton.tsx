'use client'

import { Button } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const CloseButton = () => {
  const { t } = useTranslation()

  const handleClick = () => window.close()

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
      {t('general.close')}
    </Button>
  )
}

export default CloseButton
