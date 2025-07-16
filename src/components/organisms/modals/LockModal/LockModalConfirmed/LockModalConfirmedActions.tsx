import { Box, Button } from '@mui/material'
import Link from 'next/link'
import { useChainId } from 'wagmi'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'
import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'

const LockModalConfirmedActions = () => {
  const { t } = getTranslation()

  const chainId = useChainId()

  const { txHash } = useLockModalState()

  const { closeModal } = useModalState()

  const handleClose = () => closeModal(ModalsKeys.LOCK)

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
          {t('modals.lock.actions.viewTx')}
        </Button>
      )}
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
    </Box>
  )
}

export default LockModalConfirmedActions
