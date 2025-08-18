import { Box, Button } from '@mui/material'
import Link from 'next/link'
import { useChainId } from 'wagmi'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import useLockModalState from '@/hooks/context/useLockModalState'
import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'
import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'

const UnlockModalConfirmedActions = () => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  const chainId = useChainId()

  const { txHash } = useLockModalState()

  const { closeModal } = useModalState()

  const handleClose = () => closeModal(ModalsKeys.UNLOCK)

  return (
    <Box display='flex' gap={4}>
      {txHash && (
        <Button
          variant='outlined'
          color='secondary'
          href={`${
            networks[(chainId as SupportedChainIds) || SupportedChainIds.BASE]
              .blockExplorerUrls[0]
          }/tx/${txHash}`}
          target='_blank'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
        >
          {t('modals.unlock.buttons.viewTx')}
        </Button>
      )}
      {!isLiteMode && (
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          onClick={handleClose}
          LinkComponent={Link}
          href={Routes.locking.root.url}
          sx={{ textTransform: 'capitalize' }}
        >
          {t('modals.lock.completed.lockingOverview')}
        </Button>
      )}
    </Box>
  )
}

export default UnlockModalConfirmedActions
