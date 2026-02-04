import { Box, Button } from '@mui/material'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useSWRConfig } from 'swr'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import useLockModalState from '@/hooks/context/useLockModalState'
import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'
import { useExplorerUrl } from '@/hooks/web3/useExplorerUrl'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'

const LockModalConfirmedActions = () => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  const { getTxUrl } = useExplorerUrl()

  const { txHash } = useLockModalState()

  const { mutate } = useSWRConfig()
  const hasRevalidatedRef = useRef(false)

  const { closeModal } = useModalState()

  useEffect(() => {
    if (!txHash) return
    if (hasRevalidatedRef.current) return
    hasRevalidatedRef.current = true

    void mutate(() => true, undefined, { revalidate: true })
  }, [mutate, txHash])

  const handleClose = () => closeModal(ModalsKeys.LOCK)

  return (
    <Box display='flex' gap={4}>
      {txHash && (
        <Button
          variant='outlined'
          color='secondary'
          href={getTxUrl(txHash)}
          target='_blank'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
        >
          {t('modals.lock.actions.viewTx')}
        </Button>
      )}
      {isLiteMode ? (
        <Button
          onClick={handleClose}
          variant='contained'
          color='secondary'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
        >
          {t('general.close')}
        </Button>
      ) : (
        <Button
          onClick={handleClose}
          variant='contained'
          color='secondary'
          LinkComponent={Link}
          href={Routes.locking.root.url}
          fullWidth
          sx={{ textTransform: 'capitalize' }}
        >
          {t('modals.lock.completed.lockingOverview')}
        </Button>
      )}
    </Box>
  )
}

export default LockModalConfirmedActions
