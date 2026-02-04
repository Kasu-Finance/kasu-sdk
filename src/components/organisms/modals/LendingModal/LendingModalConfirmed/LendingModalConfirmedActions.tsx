import { Box, Button } from '@mui/material'
import { useEffect, useRef } from 'react'
import { useSWRConfig } from 'swr'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'
import { useExplorerUrl } from '@/hooks/web3/useExplorerUrl'

import { ModalsKeys } from '@/context/modal/modal.types'

const LendingModalConfirmedActions = () => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  const { getTxUrl } = useExplorerUrl()

  const { txHash } = useDepositModalState()

  const { mutate } = useSWRConfig()
  const hasRevalidatedRef = useRef(false)

  const { closeModal } = useModalState()

  useEffect(() => {
    if (!txHash) return
    if (hasRevalidatedRef.current) return
    hasRevalidatedRef.current = true

    void mutate(() => true, undefined, { revalidate: true })
  }, [mutate, txHash])

  const handleClose = () => closeModal(ModalsKeys.LEND)

  return (
    <Box
      display='flex'
      gap={{ xs: 2, sm: 4 }}
      flexDirection={{ xs: 'column', sm: 'row' }}
    >
      {!isLiteMode && txHash && (
        <Button
          variant='outlined'
          color='secondary'
          href={getTxUrl(txHash)}
          target='_blank'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
        >
          {t('modals.lending.completed.viewTx')}
        </Button>
      )}
      <Button
        variant='contained'
        color='secondary'
        fullWidth
        onClick={handleClose}
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.close')}
      </Button>
    </Box>
  )
}

export default LendingModalConfirmedActions
