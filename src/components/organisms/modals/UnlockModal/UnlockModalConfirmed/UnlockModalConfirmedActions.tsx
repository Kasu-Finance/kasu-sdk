import { Box, Button } from '@mui/material'
import Link from 'next/link'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import useUnlockModalState from '@/hooks/context/useUnlockModalState'
import getTranslation from '@/hooks/useTranslation'
import { useExplorerUrl } from '@/hooks/web3/useExplorerUrl'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'

const UnlockModalConfirmedActions = () => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  const { getTxUrl } = useExplorerUrl()

  const { txHash } = useUnlockModalState()

  const { closeModal } = useModalState()

  const handleClose = () => closeModal(ModalsKeys.UNLOCK)

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
