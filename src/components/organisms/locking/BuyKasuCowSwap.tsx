import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'
import { useCallback } from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

type BuyKasuCowSwapProps = {
  buttonProps?: ButtonProps
}

const BuyKasuCowSwap: React.FC<BuyKasuCowSwapProps> = ({ buttonProps }) => {
  const { openModal } = useModalState()
  const { t } = getTranslation()

  const handleClick = useCallback(() => {
    openModal({
      name: ModalsKeys.UNRELEASED_FEATURE,
    })
  }, [openModal])

  return (
    <Button
      onClick={handleClick}
      variant='outlined'
      sx={{ textTransform: 'capitalize' }}
      {...buttonProps}
    >
      {buttonProps?.children ?? t('lite.buyAndLock.actions.buy')}
    </Button>
  )
}

export default BuyKasuCowSwap
