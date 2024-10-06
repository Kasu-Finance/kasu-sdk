import { Box, Button } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import Link from 'next/link'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'
import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'

const UnlockModalConfirmedActions = () => {
  const { t } = useTranslation()

  const { chainId } = useWeb3React()

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
    </Box>
  )
}

export default UnlockModalConfirmedActions
