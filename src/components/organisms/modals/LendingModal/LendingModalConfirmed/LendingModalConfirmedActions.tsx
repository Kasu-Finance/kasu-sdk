import { Box, Button } from '@mui/material'
import { useChainId } from 'wagmi'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'

const LendingModalConfirmedActions = () => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  const chainId = useChainId()

  const { txHash } = useDepositModalState()

  const { closeModal } = useModalState()

  const handleClose = () => closeModal(ModalsKeys.LEND)

  return (
    <Box display='flex' gap={4}>
      {!isLiteMode && txHash && (
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
